---
title: "认识线程"
date: 2020-09-15T16:17:19+08:00
draft: false
tags: ["线程","并发"]
categories: ["学习记录"]
keywords: ["线程"]  
description: "了解线程的原理"  
author: "vicebery"
---
-----
## 线程

[进程、线程相关知识](https://www.cnblogs.com/jmilkfan-fanguiju/p/10589767.html)

### 线程、进程、协程的概念

**进程**是程序执行时的一个实例，是系统资源（CPU时间、内存等）的基本单位。

**线程**是进程的一个执行流，是CPU调度和分派的基本单位，它是比进程更小的能独立运行的基本单位。一个进程由几个线程组成（拥有很多相对独立的执行流的用户程序共享应用程序的大部分数据结构），线程与同属一个进程的其他的线程共享进程所拥有的全部资源。

**协程**(用户级线程)的本质是个用户线程（在堆中创建的线程，在堆中创建模拟栈），因此无法直接利用多核优势。协程是非抢占式调度，无法实现公平的任务调度。但，其在资源消耗上是极低的，一个线程的内存在MB级别，而协程在KB级别。多个协程间并发实质上是串行执行的，只有当某个协程需要进行系统调用时，go调度器会将其调度到一个真正的内核线程上去，参与系统级别的调度，让该内核线程watiing。

[参考博文：golang中的协程](https://www.cnblogs.com/liang1101/p/7285955.html)

- G (Goroutine)，代表协程，也就是每次代码中使用 go 关键词时候会创建的一个对象
- M (Work Thread)，工作线程
- P (Processor)，代表一个处理器，又称上下文

[golang中线程、协程的关系](https://juejin.im/post/5b7678f451882533110e8948)

如果不设置 `runtime.GOMAXPROCS(1)`，那么程序将会根据操作系统的 CPU 核数而启动对应数量的 P，导致多个 M，即线程的启动。那么我们程序中的协程，就会被分配到不同的线程里面去了。

### 线程的实现

实现线程主要有3种方式：

- 使用内核线程实现
- 使用用户线程实现
- 使用用户线程加轻量级进程（LWP）混合实现

Java线程的实现：  

对于Sun JDK，它的Windows版与Linux版都是使用一对一的线程模型实现的，一条Java线程就映射到一条轻量级进程之中，轻量级进程就是我们通常意义上所讲的线程，由于每个轻量级进程都由一个内核线程支持，这个内核线程也叫做守护线程，有了这个内核线程的支持，每个轻量级进程都成为了一个独立的调度单元。

由于是基于内核线程实现的，所以各种线程操作，如创建同步，都需要进行系统调用（用户态和核态切换）。其支持的内核线程需要消耗内核资源（如内核线程的栈空间）。Linux支持的LWP数量是有限的。

### 线程调度

Java使用的线程调度方式是抢占式调度，每个线程将由系统来分配执行时间，线程的切换不由线程本身来决定。

### Java线程与Linux线程

Java中的线程对应于Linux中的一个LWP（轻量级进程），每一个LWP关联至一个特定的内核线程（也叫守护进程）。

LinuxThreads是用户空间的线程库，所采用的是线程-进程1对1模型(即一个用户线程对应一个轻量级进程，而一个轻量级进程对应一个特定的内核线程)，将线程的调度等同于进程的调度，调度交由内核完成，而线程的创建、同步、销毁由核外线程库完成（LinuxThtreads已绑定到 GLIBC中发行）。

通过这种对应方式，JVM将线程的调度交给了Linux。

### Java中栈与多线程

每个线程都会有自己的工作内存，工作内存中包括有程序计数器、虚拟机栈、本地方法栈。

每个方法调用，都有一个栈帧入栈（一般方法入虚拟机栈，native 方法入本地方法栈）。

每个栈帧包含：本地变量表，操作数栈，动态链接，返回地址等东西

- 随着线程栈的大小越大，能够支持越多的方法调用，也即是能够存储更多的栈帧；
- 局部变量表（本地变量表）内容越多，那么栈帧就越大，栈深度就越小。

`-Xss5m`设置栈大小为5m

JVM规定：如果线程请求的栈深度大于虚拟机所允许的深度，将抛出 StackOverflowError 异常；当无法申请到足够的内存时会抛出 OutOfMemoryError 异常。

### Linux下的进程与线程

 Linux下进程线程状态一般有：new、ready、running、waiting、terminated 这五种状态。


### Java线程状态

线程可以有如下6种状态：

- New(新创建)
- Runnable（可运行）
- Blocked（被阻塞）
- Waiting（等待）
- Timed waiting（计时等待）
- Terminated（被终止）

当用new操作符创建一个新线程时，该线程还没开始运行，处于New状态

一旦调用start方法，线程处于runnable状态。一个可运行的线程可能正在运行（running）也可能没有运行（ready），这取决于OS给线程提供运行的时间片。一个正在运行中的线程仍然处于可运行状态。Java线程的状态实质上是对系统线程状态的映射及包装。

无论是`Timed Waiting `，`Waiting`还是`Blocked`，对应的都是操作系统线程的**waiting（等待）**状态。
而`Runnable`状态，则对应了操作系统中的`ready`和`running`状态。

锁被占有导致线程进入`Blocked` 状态， Waiting 状态只能进入 Blocked 状态，获取锁之后才能恢复执行。

- waiting，wait()方法进入该状态， 会释放CPU执行权和锁
- Timed Waiting ，sleep()方法进入该状态，释放CPU执行权，不会被分配时间片，但仍然占有锁
- yield()方法仅释放CPU执行权，锁仍然占用，线程会被放入就绪队列，会在短时间内再次执行。



### Java线程的实现

Java中实现多线程，一般有三种方法：

- 继承Thread类，需要重写run() 方法（线程执行体），通过start()方法启动一个新线程
- 实现Runnable接口，实现Runnable()接口的类，需要重写run()方法，这个run()方法和Thread中的run()方法一样是线程的执行体，通过start()方法来启动一个新线程
- 实现Callable接口，Callable接口提供了一个call()方法作为线程执行体，call()可以有返回值，可以声明抛出异常



#### 几种创建线程的方式有什么区别？

实现Runnable和实现Callable接口的方式基本相同，不同点在于Callable接口执行call()方法有返回值

Thread实现了Runnable接口并进行了扩展

由于Java是单继承，因此继承Thread类的方式有一定的局限性




### wait和notify

notify()  
唤醒在此对象监视器上等待的单个线程

wait()  
导致当前的线程等待，直到其他线程调用此对象的notify( ) 方法或 notifyAll( ) 方法  

### ThreadLocal变量

ThreadLocal是Java里一种特殊的变量。每个线程都有一个ThreadLocal就是每个线程都拥有一个自己的独立的一个变量，竞争条件被彻底消除了。

底层实现用的HashMap，使用开放地址法来解决冲突。


## 阻塞队列

BlockingQueue是一个支持两个附加操作的队列。

这两个附加操作是：在队列为空时，获取元素的线程会等待队列为非空。当队列满时，存储元素的线程会等待队列可用。

阻塞队列常用于生产者消费者的场景，生产者是往队列里添加元素，消费者是从队列里拿元素的线程。阻塞队列就是二者存放元素的容器。

### CountDownLatch

在构造CountDownLatch的时候需要传入一个整数n，在这个整数“倒数”到0之前，主线程需要等待在门口，而这个“倒数”过程则是由各个执行线程驱动的，每个线程执行完一个任务“倒数”一次。

总结来说，CountDownLatch的作用就是等待其他的线程都执行完任务，必要时可以对各个任务的执行结果进行汇总，然后主线程才继续往下执行。

示例：

```Java
List<Map<String, Object>> namespaceData = new CopyOnWriteArrayList<>();
CountDownLatch countDownLatchApp = new CountDownLatch(namespaceList.size());
for (TenantNamespace namespace : namespaceList) {
    ThreadPoolExecutorFactory.executor.execute(new Runnable() {
        @Override
        public void run() {
            try {
                Map<String, Object> namespaceDetail = getNamespaceQuota(namespace.getNamespaceName());
                if (namespaceDetail != null) {
                    namespaceDetail.put(CommonConstant.NS_ALIASNAME, namespace.getAliasName());
                    namespaceDetail.put(CommonConstant.TENANT_ID, namespace.getTenantId());
                    namespaceData.add(namespaceDetail);
                }
            } catch (Exception e) {
                logger.error("获取分区配额失败", e);
            } finally {
                countDownLatchApp.countDown();
            }
        }
    });
}
countDownLatchApp.await();
```

## Java内存模型

Java内存模型的主要目标是定义程序中各个变量的访问规则。

Java内存模型规定了所有的变量都存储在主内存中，每条线程还有自己的工作内存，线程的工作内存中保存了被该线程使用到的变量的主内存副本拷贝（不会拷贝整个对象，只是拷贝对象引用以及使用到的某些变量）。线程对变量的所有操作都必须在工作内存中进行。而不能直接读写主内存中的变量。

Java内存模型定义了8中操作来完成变量在主内存与工作内存之间的同步问题。

- lock
- unlock
- read
- load
- use
- assign
- store
- write

### 原子性、可见性、有序性

原子性： synchronized

可见性： volatile、synchronized、final

有序性： volatile、synchronized

### volatile

可见性，禁止指令重排序优化，但不能保证对volatile变量操作的原子性。

可见性，是指当一条线程修改了这个变量的值，新值对于其他线程来说是可以立即得知的。

由于volatile变量只能保证可见性，在**不符合**以下两条规则的运算场景中，仍要通过加锁（使用synchronized 或 java.util.concurrent中的原子类）来保证原子性。

- 运算结果并不依赖变量的当前值，或者能够确保只有单一的线程修改变量的值
- 变量不需要与其他的状态变量共同参与不变约束

volatile 同步性能优于锁（synchronized 或 java.util.concurrent中的锁）。

long和double的非原子协定：允许虚拟机将没有被volatile修饰的64位数据的读写操作划分为两次32位的操作来进行。在实际开发中，目前商用虚拟机几乎都选择把64位数据的读写操作作为原子操作来对待，因此编写代码时一般不需要把用到的long和double变量专门声明为volatile。

### synchronized

互斥同步是常见的一种并发正确性保障手段。

同步是指在多个线程并发访问共享数据时，保证共享数据在同一个时刻只被一个线程使用。而互斥是实现同步的一种手段，临界区、互斥量（Mutex）和信号量（Semaphore）都是主要的互斥实现方式。

synchronized 关键字经过编译后，会在同步块的前后分别形成 monitorenter 和 monitorexit 这两个字节码指令， 在执行 monitorenter 指令时，先尝试获取对象的锁，如果这个对象没有被锁定，或者当前线程已经拥有了那个对象的锁，就把锁的计数器加1，相应的，在执行 monitorexit 指令时会将锁计数器减1，当计数器为0 时，锁就被释放。如果获取锁失败，当前线程就会被阻塞等待，直到对象锁被另一个线程释放为止。

锁计数器设置，说明 synchronized 是可重入的。

互斥同步最主要的问题就是进行线程阻塞和唤醒所带来的性能问题，这个同步称为 阻塞同步。 它属于 一种悲观的并发策略，synchronized 也称为悲观锁。

基于冲突检测的乐观并发策略

**CAS**  
V，变量的内存地址  
A，旧的预期值  
B，新值  
CAS指令执行时，当且仅当V符合预期值A时，处理器才用新值B更新V的值，否则它就不执行更新，且无论是否更新都会返回V的旧值。这个过程是一个原子操作。

CAS无法解决 ABA 问题。可以使用版本控制的方式来解决这个问题。

## 锁
### 锁升级过程

偏向锁-->轻量级锁-->重量级锁

在锁无竞争的情况下使用偏向锁，一旦有了竞争就升级为轻量级锁，升级为轻量级锁的时候需要撤销偏向锁，撤销偏向锁的时候会导致 `stop the world` 操作；


### 锁优化

- 自旋锁

挂起线程和恢复线程的操作都需要转入内核态中完成，这些操作很消耗资源。 一般地，共享数据的锁定状态只会持续很短的一段时间，为了这段时间去挂起和恢复线程并不值得。现代多核CPU能让多个线程并行执行，我们就可以让后面请求锁的那个线程“稍等一下”，但不放弃处理器的执行时间，看看持有锁的线程是否很快就会释放锁。为了让线程等待，我们只需让线程执行一个忙循环（自旋），这就是所谓的自旋锁。

- 锁消除

锁消除是指虚拟机即时编译器在运行时，对一些代码上要求同步，但是被检测到不可能存在共享数据竞争的锁进行消除。

- 锁粗化

如果虚拟机探测到有这样一串零碎的操作都对同一个对象加锁，将会把加锁同步的范围扩展（粗化）到整个操作序列的外部。

- 偏向锁

偏向锁的目的是消除数据在无竞争情况下的同步原语。

- 轻量级锁

在无竞争的情况下使用CAS操作去消除同步使用的互斥量。如果有两条以上的线程争用同一个锁，那轻量级锁就不再有效，要膨胀为重量级锁。两个线程争用同步资源时，没有获取资源的线程自旋等待锁释放，获取到资源（轻量级锁）的线程使用CAS操作来



[Java 的 锁 介绍](https://tech.meituan.com/2018/11/15/java-lock.html)

