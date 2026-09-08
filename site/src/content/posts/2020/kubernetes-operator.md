---
title: "operator开发实践"
date: 2020-01-15T13:51:52+08:00
draft: false
tags: ["Kubernetes","k8s","operator","go"]
categories: ["学习记录"]
keywords: ["Kubernetes","operator","go"]  
description: "k8s的operator开发实践"  
author: "vicebery"
---
-----
## operator的概念
kubernetes对于无状态应用能够很好地调度处理，对于有状态的应用提供了一个[`Statefulset`](https://kubernetes.io/zh/docs/concepts/workloads/controllers/statefulset/)来处理，但`Statefulset`对于有状态应用的支持相当有限，稍微复杂一点的有状态应用就支持不了，为了对实际生产中的各种复杂应用提供更好的支持，我们需要创建一个自定义的控制器对Kubernetes API进行拓展，这种面向特定应用的控制器我们称之为`Operator`。

`Operator`一般包含对`Kubernetes`内置资源、用户自定义资源的调度，用户自定义资源本质上也是`Kubernetes`内置资源的一个包装和拓展，因此这个`controller`本质上还是对`kubernetes`内置资源的调度，不同于`Kubernetes API`提供的配置、管理，`controller`给用户的自由度更高，能根据用户自己的需求来调度各种资源以满足更多复杂的业务场景。

Operator基于两个Kubernetes的核心概念： 资源和控制器，从技术上来讲，就是通过CRD和controller来实现。CRD用来定义一些我们的调度逻辑所需的参数，并接收参数，controller根据接收到的参数来进行相应的调度逻辑。

Operator一般以单一Deployment的形式进行部署，作为集群中的一个Pod来运行。Operator运行起来后，会实例化一个我们编写好的controller，该controller会监听、调度CRD资源以及内置资源，以此来达到我们的运维需求。

[operator的发展历程](https://segmentfault.com/a/1190000017856615)
## 案例实践
下面将以一个实际开发中的案例来介绍一下operator的开发过程。

在该案例中，业务系统每次启动都会根据Oracle数据库中的一个表来初始化一个工作流队列，工作队列启动停止会有一定顺序，并且也会触发数据库里的一些操作，我们需要做的是按照时间来调度启动的工作流数量。具体业务不详述了，我们着重关注下operator开发的一些通用步骤。

主要有生成框架代码，编写controller代码两大块。

## 开发环境
建议在linux下开发，因为最终operator开发好后的运行环境是在kubernetes集群中，集群运行在Linux上。另外开发过程中也会有一些依赖区分系统环境的（比如：此项目中的oracle驱动oci8），如果在window下开发，最终编译时还得改回来。

前期没有使用IDE，后面发现controller代码还是挺多的，如果不用IDE，效率很低，因此使用goland来开发。

此次开发是在`Ubuntu 18.04.1`上，需要事先安装好golang、git，golang建议版本在`1.12`以上，支持`go module`，依赖包管理会方便很多。
## 主要步骤
### 创建CRD
首先，在kubernetes集群下，创建我们自定义的资源，就和pod、deployment资源一样，建好后我们可以新建删除。但这时的新建删除并没有执行我们想要的操作，需要controller来实现。

创建一个`crd.yaml`文件，内容如下：
```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  # metadata.name的内容是由"复数名.分组名"构成，如下，workflows是复数名，vicebery.cn是分组名
  name: workflows.vicebery.cn
spec:
  # 分组名，在REST API中也会用到的，格式是: /apis/分组名/CRD版本，后面controller也会用到，注意保持一致
  group: vicebery.cn
  versions:
    - name: v1
      served: true
      storage: true
  # 范围是属于namespace的
  scope: Namespaced
  names:
    plural: workflows
    singular: workflow
    # 类型名
    kind: Workflow
    # 简称，就像service的简称是svc
    shortNames:
      - wkf
```
在当前文件的目录下使用命令行创建新的资源类型：`kubectl create -f crd.yaml`

该步骤会在kubernetes集群中生成一个新的资源类型，在controller的代码中会监听该资源的状态，根据其属性来做出相应的调整。下面开始controller的编写。
### 生成代码
在正式编写controller的业务代码之前，需要先根据我们自定义的资源类型生成一些脚手架代码，这些代码给我们提供了监听、调度自定义资源的接口，我们可以直接使用，有了这些代码，我们可以将更多的精力放在业务逻辑上。

在`$GOPATH/src/`下创建一个目录`billing-system-workflow-operator`，在该目录下，执行命令`mkdir -p pkg/apis/workflowoperator`
创建三层目录；

在`workflowoperator`目录下创建文件`register.go`，文件内容如下：
```go
package workflowoperator

const (
	GroupName = "vicebery.cn"
	Version   = "v1"
)
```

在`workflowoperator`目录下创建下创建目录`v1`，在`v1`目录下创建`doc.go`，文件内容如下：
```go
// +k8s:deepcopy-gen=package

// +groupName=vicebery.cn
package v1
```

在`v1`目录下新建`register.go`，文件内容如下：
```go
package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"

	register "vicebery.cn/billing-system-workflow-operator/pkg/apis/workflowoperator"
)

var SchemeGroupVersion = schema.GroupVersion{
	Group:   register.GroupName,
	Version: register.Version,
}

var (
	SchemeBuilder = runtime.NewSchemeBuilder(addKnownTypes)
	AddToScheme   = SchemeBuilder.AddToScheme
)

func Resource(resource string) schema.GroupResource {
	return SchemeGroupVersion.WithResource(resource).GroupResource()
}

func Kind(kind string) schema.GroupKind {
	return SchemeGroupVersion.WithKind(kind).GroupKind()
}

func addKnownTypes(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(
		SchemeGroupVersion,
		&Workflow{},
		&WorkflowList{},
	)

	// register the type in the scheme
	metav1.AddToGroupVersion(scheme, SchemeGroupVersion)
	return nil
}
```

在`v1`目录下新建`types.go`，里面定义了 `Workflow` 对象的具体内容，按照实际的业务需求来： 
```go
package v1

import (
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +genclient:noStatus
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

type Workflow struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              WorkflowSpec   `json:"spec,omitempty"`
	Status            WorkflowStatus `json:"status, omitempty"`
}

type WorkflowSpec struct {
	Database         Database                  `json:"database" protobuf:"bytes,1,name=database"`
	Replicas         *int32                    `json:"replicas" protobuf:"varint,2,opt,name=replicas"`
	Hpa              []Hpa                     `json:"hpa,omitempty" protobuf:"bytes,3,rep,name=hpa"`
	InitImage        string                    `json:"initImage" protobuf:"bytes,4,name=initImage"`
	Image            string                    `json:"image" protobuf:"bytes,5,name=image"`
	ImagePullPolicy  v1.PullPolicy             `json:"imagePullPolicy,omitempty" protobuf:"bytes,6,opt,name=imagePullPolicy"`
	ImagePullSecrets []v1.LocalObjectReference `json:"imagePullSecrets,omitempty" patchStrategy:"merge" patchMergeKey:"name" protobuf:"bytes,7,rep,name=imagePullSecrets"`
	Ports            []v1.ContainerPort        `json:"ports,omitempty" protobuf:"bytes,8,rep,name=ports"`
	EnvFrom          []v1.EnvFromSource        `json:"envFrom,omitempty" protobuf:"bytes,9,rep,name=envFrom"`
	Env              []v1.EnvVar               `json:"env,omitempty" patchStrategy:"merge" patchMergeKey:"name" protobuf:"bytes,10,rep,name=env"`
	Resources        v1.ResourceRequirements   `json:"resources,omitempty" protobuf:"bytes,11,opt,name=resources"`
	Config           Config                    `json:"config,omitempty" protobuf:"bytes,12,opt,name=config"`
	HealthCheck      HealthCheck               `json:"healthCheck,omitempty" protobuf:"bytes,13,opt,name=healthCheck"`
	Storage          Storage                   `json:"storage,omitempty" protobuf:"bytes,14,opt,name=storage"`
	Server           int                       `json:"server" protobuf:"bytes,15,name=server"`
}

type WorkflowStatus struct {
	LastScheduleTime *metav1.Time `json:"lastScheduleTime,omitempty" protobuf:"bytes,1,opt,name=lastScheduleTime"`
	CurrentReplicas  *int32       `json:"currentReplicas" protobuf:"varint,2,opt,name=currentReplicas"`
	ScheduleReason   string       `json:"scheduleReason" protobuf:"bytes,3,name=scheduleReason"`
}

type Database struct {
	Url         string `json:"url" protobuf:"bytes,1,name=url"`
	SecretsName string `json:"secretName" protobuf:"bytes,2,name=secretsName"`
	// TODO 入文档
	Procedure []string `json:"proc" protobuf:"bytes,3,name=proc"`
}

type Hpa struct {
	Cron     string `json:"cron,omitempty" protobuf:"bytes,1,name=cron"`
	Replicas int32  `json:"replicas,omitempty" protobuf:"varint,2,name=replicas"`
}

type Config struct {
	ConfigTemplate string `json:"configTemplate,omitempty" protobuf:"bytes,1,name=configTemplate"`
	// TODO 入文档
	Path     string     `json:"path, omitempty" protobuf:"bytes,2,name=path"`
	Override []Override `json:"override,omitempty" protobuf:"bytes,3,rep,name=override"`
}

type Override struct {
	Index uint16 `json:"index,omitempty" protobuf:"varint,1,name=index"`
	Filed string `json:"filed,omitempty" protobuf:"bytes,2,name=filed"`
	Value string `json:"value,omitempty" protobuf:"bytes,3,name=value"`
}

type HealthCheck struct {
	ReadinessProbe *v1.Probe `json:"readinessProbe,omitempty" protobuf:"bytes,1,name=readinessProbe"`
	LivenessProbe  *v1.Probe `json:"livenessProbe,omitempty" protobuf:"bytes,2,name=livenessProbe"`
}

type Storage struct {
	StorageClassName *string           `json:"storageClassName,omitempty" protobuf:"bytes,1,opt,name=storageClassName"`
	StorageResource  resource.Quantity `json:"storageResource,omitempty" protobuf:"bytes,2,opt,name=storageResource"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// WorkflowList is a list of Workflow resources
type WorkflowList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Workflow `json:"items"`
}

```
以上文件都建好后，在`$GOPATH/src/vicebery.cn/billing-system-workflow-operator/pkg`使用`tree`命令，结构如下：
```shell
tree
.
├── apis
│   └── workflowoperator
│       ├── register.go
│       └── v1
│           ├── doc.go
│           ├── register.go
│           └── types.go
```

接下来，我们使用[apimachinery](https://github.com/kubernetes/apimachinery)和[code-generator](https://github.com/kubernetes/code-generator)来生成代码，这里需要特别注意**版本对应**的问题，根据**目标集群版本**来选择对应的版本。

为了避免后续版本依赖管理混乱，我们使用`go mod`来管理依赖

初始化模块：  
```shell
cd $GOPATH/src/vicebery.cn/billing-system-workflow-operator
go mod init vicebery.cn/billing-system-workflow-operator

# 执行完后在当前目录生成go.mod文件，该文件记录着当前使用的依赖包及对应版本
```

拉取依赖(注意版本对应问题)，执行生成代码的脚步：
```shell
cd $GOPATH/src/vicebery.cn/billing-system-workflow-operator \
&& go get k8s.io/apimachinery/pkg/apis/meta/v1@release-1.12 \
&& go get k8s.io/code-generator/...@release-1.12 \
&& cd $GOPATH/src/k8s.io/code-generator \
./generate-groups.sh all vicebery.cn/billing-system-workflow-operator/pkg/client vicebery.cn/billing-system-workflow-operator/pkg/apis workflowoperator:v1
```

执行完代码生成脚步后，会在终端看到相应的打印信息：
```shell
Generating deepcopy funcs
Generating clientset for workflowoperator:v1 at vicebery.cn/billing-system-workflow-operator/pkg/client/clientset
Generating listers for workflowoperator:v1 at vicebery.cn/billing-system-workflow-operator/pkg/client/listers
Generating informers for workflowoperator:v1 at vicebery.cn/billing-system-workflow-operator/pkg/client/informers
```
再次用`tree`查看文件结构，发现自动生成了很多文件：
```shell
vicebery@vicebery-pc:~/go/src/vicebery.cn/billing-system-workflow-operator/pkg$
tree
.
├── apis
│   └── workflowoperator
│       ├── register.go
│       └── v1
│           ├── doc.go
│           ├── register.go
│           ├── types.go
│           └── zz_generated.deepcopy.go
├── client
│   ├── clientset
│   │   └── versioned
│   │       ├── clientset.go
│   │       ├── doc.go
│   │       ├── fake
│   │       │   ├── clientset_generated.go
│   │       │   ├── doc.go
│   │       │   └── register.go
│   │       ├── scheme
│   │       │   ├── doc.go
│   │       │   └── register.go
│   │       └── typed
│   │           └── workflowoperator
│   │               └── v1
│   │                   ├── doc.go
│   │                   ├── fake
│   │                   │   ├── doc.go
│   │                   │   ├── fake_workflow.go
│   │                   │   └── fake_workflowoperator_client.go
│   │                   ├── generated_expansion.go
│   │                   ├── workflow.go
│   │                   └── workflowoperator_client.go
│   ├── informers
│   │   └── externalversions
│   │       ├── factory.go
│   │       ├── generic.go
│   │       ├── internalinterfaces
│   │       │   └── factory_interfaces.go
│   │       └── workflowoperator
│   │           ├── interface.go
│   │           └── v1
│   │               ├── interface.go
│   │               └── workflow.go
│   └── listers
│       └── workflowoperator
│           └── v1
│               ├── expansion_generated.go
│               └── workflow.go

```

以上`go get`以及执行脚步的过程中，一般会出现找不到依赖包或者网络不通的问题，这是国内网络导致，需要让终端能连上外网，具体的解决方案这里不详述。



### 编写controller
在`$GOPATH/src/vicebery.cn/billing-system-workflow-operator/pkg/`目录下新建目录`signals`，在`signals`目录下新建文件`signal_posix.go` ，内容如下：
```go
// +build !windows

package signals

import (
	"os"
	"syscall"
)

var shutdownSignals = []os.Signal{os.Interrupt, syscall.SIGTERM}
```

在 `signals` 目录下新建文件 `signal_windows.go`，内容如下：
```go
package signals

import (
	"os"
)

var shutdownSignals = []os.Signal{os.Interrupt}
```

在 `signals` 目录下新建文件 `signal.go`，内容如下：
```go
package signals

import (
        "os"
        "os/signal"
)

var onlyOneSignalHandler = make(chan struct{})

func SetupSignalHandler() (stopCh <-chan struct{}) {
        close(onlyOneSignalHandler) // panics when called twice

        stop := make(chan struct{})
        c := make(chan os.Signal, 2)
        signal.Notify(c, shutdownSignals...)
        go func() {
                <-c
                close(stop)
                <-c
                os.Exit(1) // second signal. Exit directly.
        }()

        return stop
}
```

在`$GOPATH/src/vicebery.cn/billing-system-workflow-operator/pkg/`目录下新建目录`controller`目录和`cmd`目录，在`cmd`目录下新建`main.go`文件，文件内容如下：
```go
package main

import (
	"flag"
	"fmt"
	"os"
	"os/user"
	"path/filepath"

	"k8s.io/client-go/rest"

	"github.com/golang/glog"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	// Uncomment the following line to load the gcp plugin (only required to authenticate against GKE clusters).
	// _ "k8s.io/client-go/plugin/pkg/client/auth/gcp"

	clientset "vicebery.cn/billing-system-workflow-operator/pkg/client/clientset/versioned"
	informers "vicebery.cn/billing-system-workflow-operator/pkg/client/informers/externalversions"
	myController "vicebery.cn/billing-system-workflow-operator/pkg/controller"
	//"vicebery.cn/billing-system-workflow-operator/pkg/controller/oracle"
	"vicebery.cn/billing-system-workflow-operator/pkg/signals"
)

var (
	masterURL  string
	kubeconfig string
)

const ENV_OPERATOR_NAMESPACE = "OPERATOR_NAMESPACE"

func main() {
	flag.Parse()

	// 处理信号量
	stopCh := signals.SetupSignalHandler()

	// 获取配置信息
	cfg, err := GetConfig()
	if err != nil {
		glog.Fatalf("Error building kubeconfig: %s", err.Error())
	}

	kubeClient, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		glog.Fatalf("Error building kubernetes clientset: %s", err.Error())
	}

	//创建workflow的clientset
	workflowClient, err := clientset.NewForConfig(cfg)
	if err != nil {
		glog.Fatalf("Error building example clientset: %s", err.Error())
	}

	//监听workflow资源变化的工厂
	//第二个入参为k8s将local cache数据回调给event handler的时间间隔
	workflowInformerFactory := informers.NewSharedInformerFactoryWithOptions(workflowClient, 0, informers.WithNamespace(os.Getenv(ENV_OPERATOR_NAMESPACE)))

	//得到controller
	//传入参数解释： kubeClient-->CRUDk8s资源，workflowClient-->CRUD 自定义资源，
	//workflowInformerFactory.Vicebery().V1().Workflows()-->Workflow资源的监听器
	controller := myController.NewController(kubeClient, workflowClient,
		workflowInformerFactory.Vicebery().V1().Workflows())

	//启动informer
	go workflowInformerFactory.Start(stopCh)
	controller.Run(stopCh)
}

// 获取集群配置信息
func GetConfig() (*rest.Config, error) {
	if len(kubeconfig) > 0 {
		return clientcmd.BuildConfigFromFlags(masterURL, kubeconfig)
	}
	if len(os.Getenv("KUBECONFIG")) > 0 {
		return clientcmd.BuildConfigFromFlags(masterURL, os.Getenv("KUBECONFIG"))
	}
	if c, err := rest.InClusterConfig(); err == nil {
		return c, nil
	}
	if usr, err := user.Current(); err == nil {
		if c, err := clientcmd.BuildConfigFromFlags(
			"",
			filepath.Join(usr.HomeDir, ".kube", "config"),
		); err == nil {
			return c, nil
		}
	}
	return nil, fmt.Errorf("could not locate a kubeconfig")
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to a kubeconfig. Only required if out-of-cluster.")
	flag.StringVar(&masterURL, "master", "", "The address of the Kubernetes API server. Overrides any value in kubeconfig. Only required if out-of-cluster.")

}

```

在`$GOPATH/src/vicebery.cn/billing-system-workflow-operator/pkg/`目录下新建目录`controller`目录和`cmd`目录，在`controller`目录下新建`controller.go`文件，在controller文件中编写相应的业务逻辑：
```go
package controller

import (
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/arduino/go-properties-map"
	"github.com/golang/glog"
	cronutil "github.com/robfig/cron"
	"vicebery.cn/billing-system-workflow-operator/pkg/controller/workload"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/record"
	"k8s.io/client-go/util/workqueue"

	workflowoperatorv1 "vicebery.cn/billing-system-workflow-operator/pkg/apis/workflowoperator/v1"
	clientset "vicebery.cn/billing-system-workflow-operator/pkg/client/clientset/versioned"
	workflowscheme "vicebery.cn/billing-system-workflow-operator/pkg/client/clientset/versioned/scheme"
	informers "vicebery.cn/billing-system-workflow-operator/pkg/client/informers/externalversions/workflowoperator/v1"
	listers "vicebery.cn/billing-system-workflow-operator/pkg/client/listers/workflowoperator/v1"
	"vicebery.cn/billing-system-workflow-operator/pkg/controller/oracle"
)

const RecorderCompName = "workflow-controller"
const EnvOperatorNamespace = "OPERATOR_NAMESPACE"

// Controller is the controller implementation for workflow resources
type Controller struct {
	// kubeclientset is a standard kubernetes clientset
	kubeclientset kubernetes.Interface
	// workflowclientset is a clientset for our own API group
	workflowclientset clientset.Interface

	workflowLister listers.WorkflowLister
	workflowSynced cache.InformerSynced

	workqueue workqueue.RateLimitingInterface

	recorder record.EventRecorder
}

// NewController returns a new workflow controller
func NewController(
	kubeclientset kubernetes.Interface,
	workflowclientset clientset.Interface,
	workflowInformer informers.WorkflowInformer) *Controller {

	utilruntime.Must(workflowscheme.AddToScheme(scheme.Scheme))
	eventBroadcaster := record.NewBroadcaster()
	eventBroadcaster.StartLogging(glog.Infof)
	eventBroadcaster.StartRecordingToSink(&typedcorev1.EventSinkImpl{Interface: kubeclientset.CoreV1().Events("")})
	recorder := eventBroadcaster.NewRecorder(scheme.Scheme, corev1.EventSource{Component: RecorderCompName})

	controller := &Controller{
		kubeclientset:     kubeclientset,
		workflowclientset: workflowclientset,
		workflowLister:    workflowInformer.Lister(),
		workflowSynced:    workflowInformer.Informer().HasSynced,
		workqueue:         workqueue.NewNamedRateLimitingQueue(workqueue.DefaultControllerRateLimiter(), "Workflow"),
		recorder:          recorder,
	}

	// Set up an event handler for when Workflow resources change
	workflowInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    controller.enqueueWorkflow,
		UpdateFunc: controller.enqueueWorkflowForUpdate,
		DeleteFunc: controller.enqueueWorkflowForDelete,
	})

	return controller
}

//在此处开始controller的业务
func (c *Controller) Run(stopCh <-chan struct{}) {
	defer runtime.HandleCrash()
	defer c.workqueue.ShutDown()

	glog.Infof("starting HA PBRC billing system workflow operator")

	if !cache.WaitForCacheSync(stopCh, c.workflowSynced) {
		_ = fmt.Errorf("failed to wait for caches to sync")
	}

	go wait.Until(c.runWorker, time.Second, stopCh)

	<-stopCh
	glog.Infof("HA PBRC billing system workflow operator has stopped")
}

func (c *Controller) runWorker() {
	for c.processNextWorkItem() {
	}
}

// 取数据处理
func (c *Controller) processNextWorkItem() bool {
	key, shutdown := c.workqueue.Get()
	if shutdown {
		return false
	}
	defer c.workqueue.Done(key)

	glog.V(10).Infof("operator queue length is :%v", c.workqueue.Len())

	err := c.syncHandler(key.(string))
	if err != nil {
		return true
	}

	runtime.HandleError(err)
	return true
}

// 处理
func (c *Controller) syncHandler(key string) error {
	// Convert the namespace/name string into a distinct namespace and name
	namespace, name, err := cache.SplitMetaNamespaceKey(key)
	if err != nil {
		return err
	}

	// 从local cache 中获取对应的workflow
	workflow, err := c.workflowLister.Workflows(namespace).Get(name)
	if errors.IsNotFound(err) {
		glog.Errorf("Workflow resource named %s has been deleted in %s", name, namespace)
		return err
	}

	// 获取默认配置
	defaultConsumerThreadSize, err := c.getDefaultConsumerThreadSize(workflow)
	if err != nil {
		glog.Errorf("Failed get default consumer.thread.size from workflow.properties, error message is %s", err)
		return err
	}

	// 新建workflow 相关业务逻辑
	// 省略……

	return nil
}

// 数据先放入缓存，再入队列
func (c *Controller) enqueueWorkflow(obj interface{}) {
	// 将对象放入缓存
	key, err := cache.MetaNamespaceKeyFunc(obj)
	if err != nil {
		runtime.HandleError(err)
		return
	}

	// 将key放入队列
	c.workqueue.AddRateLimited(key)
}

// 删除操作
func (c *Controller) enqueueWorkflowForDelete(obj interface{}) {
	// 从缓存中删除指定对象
	_, err := cache.DeletionHandlingMetaNamespaceKeyFunc(obj)
	if err != nil {
		runtime.HandleError(err)
		return
	}
	workflow := obj.(*workflowoperatorv1.Workflow)
	// 删除StatefulSet
	if err := c.deleteStsAndPVC(workflow); err != nil {
		glog.V(10).Infof("delete statefulSet error : %s", err)
		return
	}
}

// 更新操作
func (c *Controller) enqueueWorkflowForUpdate(oldObj, newObj interface{}) {
	oldWorkflow := oldObj.(*workflowoperatorv1.Workflow).DeepCopy()
	newWorkflow := newObj.(*workflowoperatorv1.Workflow).DeepCopy()
	glog.V(10).Infof("updating Workflow %s", oldWorkflow)

	// 全部相同
	if reflect.DeepEqual(oldWorkflow.Spec, newWorkflow.Spec) {
		glog.V(10).Infof("old workflow equal new workflow, nothing will happen")
		return
	}

	// HPA不相同，其他地方相同
	if !reflect.DeepEqual(oldWorkflow.Spec.Hpa, newWorkflow.Spec.Hpa) {
		oldWorkflow.Spec.Hpa = nil
		newWorkflow.Spec.Hpa = nil
		if reflect.DeepEqual(oldWorkflow.Spec, newWorkflow.Spec) {
			glog.Infof("update hpa policy of %s in %s, from %v to %v", newWorkflow.Name, newWorkflow.Namespace, oldWorkflow.Spec.Hpa, newWorkflow.Spec.Hpa)
			return
		}
	}

	c.enqueueWorkflowForDelete(oldObj.(*workflowoperatorv1.Workflow))
	c.enqueueWorkflow(newObj.(*workflowoperatorv1.Workflow))
}

```

### 核心代码分析
自动生成的代码所提供的API：

![client-go框架](/img/operator.jpg)


[code-generator项目](https://github.com/kubernetes/code-generator)实现了对CRD资源的监听和操作，但其只是实现了一些规范性的代码，具体的业务代码还需要我们去完善。

对于自定义的controller,有几点概念需要明确：

- 1）informer：生成的代码，监听apiserver中特定资源变化，然后会存储到一个线程安全的local cache中，最后回调我们自己实现的event handler。
  
- 2）local cache：生成的代码，informer实时同步apiserver（也就是etcd）中的数据到内存中存储，可以有效降低apiserver的查询压力，但缺点就是实时性不好，本地会比远程的数据落后一点点但会最终与etcd一致，所以需要根据情况具体分析是走Local cache还是apiserver实时获取数据。

- 3）lister：生成的代码，提供了CURD操作访问local cache。

- 4）controller：一个逻辑概念，就是指调度某种资源的实现而已，需要我们自己开发。Controller做的事情主要包括：
 - a) 实现event handler处理资源的CURD操作
 - b) 在event handler，可以使用workqueue类库实现相同资源对象的连续event的去重，以及event处理异常后的失败重试，通常是建议使用的。

- 5）Workqueue：一个单独的类库，是可选使用的，但通常都会使用，原因上面说了。我们需要在实现event handler的时候把发生变化的资源标识放入workqueue，供下面的processor消费。

- 6）Clientset：默认clientset只能CRUD k8s提供的资源类型，比如deployments，daemonset等；生成的代码为我们自定义的资源（CRD）生成了单独的clientset，从而让我们使用结构化的代码CURD自定义资源。也就是说，想操作内建资源就用k8s自带的clientset，想操作CRD就用生成代码里的clientset。

- 7）Processor：我们实现的go协程，消费workqueue中的事件，workqueue提供了按资源标识的去重。

对于自定义的CRD的监听`informer`会在一定时间间隔内扫描反馈资源的变动，然后去调用`AddFunc`,`UpdateFunc`,`DeleteFunce`，因此对于资源的增删改的具体业务代码可以在上述三个函数内实现。
### 部署测试
待补充
