---
title: "Java中的String"
date: 2019-04-09T22:32:19+08:00
draft: false
tags: ["java","String"]
categories: ["学习记录"]
keywords: ["java","String"]  
author: "vicebery"
---
-----
## String类
Java中没有内置的字符串类型，而在标准Java类库中提供了一个预定义类String。每个用双引号括起来的字符串都是String类的一个实例。String类中没有提供用于修改字符串的方法。故String类对象称为不可变字符串。  
空串""是长度为0的字符串，是一个Java对象，有自己的串长度（0）和内容（空）

String、StringBuilder和StringBuffer  
执行速度：`StringBuilder>StringBuffer>String` 
StringBuilder 和 StringBuffer均为字符串变量，两者的对象是变量，是可以更改的。  
StringBuilder线程不安全，适用于单线程下在字符缓冲区进行大量操作的情况  
StringBuffer线程安全，适用于多线程下在字符缓冲区进行大量操作的情况 

### String的特性
1、String类是`final`的，不可被继承。

2、String类是的本质是字符数组char[], 并且其值不可改变。

3、String类对象有个特殊的创建的方式，就是直接指定比如`String x = "abc"`，"abc"就表示一个字符串对象。而x是"abc"对象的地址，也叫做"abc"对象的引用。

4、String对象可以通过“+”串联。串联后会生成新的字符串。

5、Java运行时会维护一个`String Pool`（String池），JavaDoc翻译很模糊“字符串缓冲区”。String池用来存放运行时中产生的各种字符串，并且池中的字符串的内容不重复。而一般对象不存在这个缓冲池，并且创建的对象仅仅存在于方法的堆栈区。

6、创建字符串的方式很多，归纳起来有三类：

其一，使用new关键字创建字符串，比如`String s1 = new String("abc")`;

其二，直接指定。比如`String s2 = "abc"`;

其三，使用串联生成新的字符串。比如`String s3 = "ab" + "c"`; 

### String对象创建
String对象创建的原理：

- **原理1**：当使用任何方式来创建一个字符串对象`s=X`时，Java运行时（运行中JVM）会拿着这个X在String池中找是否存在内容相同的字符串对象，如果不存在，则在池中创建一个字符串s，否则，不在池中添加。
 
- **原理2**：Java中，只要使用new关键字来创建对象，则一定会（在堆区或栈区）创建一个新的对象。
 
- **原理3**：使用直接指定或者使用纯字符串串联来创建String对象，则仅仅会检查维护String池中的字符串，池中没有就在池中创建一个，有则罢了，但绝不会在堆栈区再去创建该String对象。
 
- **原理4**：使用包含变量的表达式来创建String对象，则不仅会检查维护String池，而且还会在堆栈区创建一个String对象。

 ## 字符串常量池（String Pool）
字符串的分配，和其他的对象分配一样，耗费高昂的时间与空间代价，作为最基础的数据类型，大量频繁的创建字符串，极大程度地影响程序的性能。

JVM为了提高性能和减少内存开销，在实例化字符串常量的时候进行了一些优化
- 为字符串开辟一个字符串常量池，类似于缓存区
- 创建字符串常量时，首先检查字符串常量池是否存在该字符串
- 存在该字符串，返回引用实例，不存在，实例化该字符串并放入池中

实现的基础：

- 实现该优化的基础是因为字符串是不可变的，可以不用担心数据冲突进行共享
- 运行时实例创建的全局字符串常量池中有一个表，总是为池中每个唯一的字符串对象维护一个引用,这就意味着它们一直引用着字符串常量池中的对象，所以，在常量池中的这些字符串不会被垃圾收集器回收

字符串常量池是方法区的一部分，方法区属于静态区，跟堆一样，被所有线程共享，方法区中保存的都是在整个程序中永远唯一的元素，比如class，static变量等

```Java
String str = new String("hello");//会创建多少个对象？
```
使用new来创建String对象，首先会在常量池中查找是否有“hello”对象，没有就新建一个，然后会在堆中new一个String（“hello”）对象。

[String的存储问题](https://segmentfault.com/a/1190000009888357)

[String放入运行时常量池的时机与String.intern()方法解惑](https://www.kancloud.cn/digest/rainnnbow-javabase/136297)

## Object类的两个方法
### equals方法
Object类中的equals方法用于检测一个对象是否等于另一个对象。这个方法将判断两个对象是否具有相同的引用。

五种特性：
- [x] 自反性
- [x] 对称性
- [x] 传递性
- [x] 一致性
- [x] 对于任意非空引用x，x.equals(null)应该返回false

### hashcode方法
散列码是由对象导出的一个整数值，hashCode方法定义在Object类中，故每个对象都有一个默认的散列码，其值为对象的存储地址。

字符串的散列码是由内容导出的，因此String new出两个相同字符串其对象拥有相同的散列码，StringBuffer new出两个相同字符串却拥有不同散列码，是因为在StringBuffer类中没有定义hashCode方法，它的散列码是由Object类的默认hashCode方法导出的对象存储地址。

String类和八大包装类都是重写了equals和hashcode方法，因此equals比较的是两个对象的value值是否相等，如果没有重写equals方法，那么比较的将是对象的引用是否指向同一块内存地址。

JDK中 `hashcode` 方法的规定：  
- 在 Java 应用程序执行期间，在对同一对象多次调用 hashCode 方法时，必须一致地返回相同的整数，前提是将对象进行 equals 比较时所用的信息没有被修改。从某一应用程序的一次执行到同一应用程序的另一次执行，该整数无需保持一致。
- 如果根据 `equals(Object)` 方法，两个对象是相等的，那么对这两个对象中的每个对象调用 hashCode 方法都必须生成相同的整数结果。
- 如果根据 `equals(java.lang.Object)` 方法，两个对象不相等，那么对这两个对象中的任一对象上调用 hashCode方法不 要求一定生成不同的整数结果。但是，程序员应该意识到，为不相等的对象生成不同整数结果可以提高哈希表的性能。

## 关于“==”与equals
对于基本数据类型的比较，只能用“==”，因为基本数据类型没有equals方法，equals方法是Object类下的一个方法，如果不重写这个方法的话，那么用equals判断两个对象是否相等与“==”没有区别，本质上都是在比较引用指向的内存地址。

但，Java中重写了包装类和String类的equals方法和hashcode方法，使得equals方法的功能变成了比较对象的值而不是对象的地址，这更符合现实逻辑（现实中我们不会关心对象存储在哪个地址上）。

前面提到JVM会使用String Pool来来优化存储字符串，事实上在Integer类中也有一些优化：
```Java
public static void main(String[] args) {
      Integer a = 2;
      Integer b = 2;
      System.out.println(a == b);   //输出true
        
      Integer a1 = 128;
      Integer b1 = 128;
      System.out.println(a1 == b1);    //输出false
        
}
```
分析：以上程序，当两个2自动装箱后，比较相等，但是两个128自动装箱后就不相等。
这是因为系统内部提供了一个缓存功能，把`-128~127`之间的整数自动装箱成一个`Integer`时，实际上直接指向对象的数值元素，而`-128~127`范围外的整数自动装箱成`Integer`时，总是新创建一个`Integer`实例。

