---
title: "Java Collections 概览"
date: 2019-03-27T09:19:16+08:00
draft: false
tags: ["java","Collections"]
categories: ["学习记录"]
keywords: ["java","Collections"]  
author: "vicebery"
---
-----
## 总体框架
Java容器是Java提供的工具包，包含了常用的数据结构：集合、链表、队列、栈、数组、映射等。Java容器工具包位置是java.util.*

Java集合主要可以划分为4个部分：
- [x] List列表
- [x] Set集合
- [x] Map映射
- [x] 工具类（Iterator迭代器、Enumeration枚举类、Arrays和Collections）

主要有三大接口Collection、Map、Iterator

**Collection**接口是一个高度抽象出来的集合，它包含了集合的基本操作和属性。主要有List接口和Set接口两个分支

List是一个逻辑上有序（区别于元素有序--从大到小，从小到大）的队列，每一个元素都有它的索引，第一个元素的索引值是0，第二个是1……  
List的实现类有LinkedList，ArrayList，Vector，Stack

Set是一个不允许有重复元素的集合。  
Set的实现类有HashSet，TreeSet。HashSet依赖于HashMap

**Map**是一个映射接口，即Key-value键值对。AbstractMap是个抽象类，它实现了Map接口中的大部分API。而HashMap，TreeMap，WeakHashMap都是继承自AbstractMap。

**Iterator**是遍历集合的工具，即我们通常通过Iterator迭代器来遍历集合。我们说Collection依赖于Iterator，是因为Collection的实现类都要实现iterator()函数，返回一个Iterator对象。

ListIterator是专门为遍历List而存在的。

### 工具类
#### Arrays 类
java.util.Arrays 类能方便地操作数组，它提供的所有方法都是静态的。

具有以下功能：

- 给数组赋值：通过 fill 方法。
- 对数组排序：通过 sort 方法,按升序。
- 比较数组：通过 equals 方法比较数组中元素值是否相等。
- 查找数组元素：通过 binarySearch 方法能对排序好的数组进行二分查找法操作。

#### Collections类
常见方法：

1，对list进行二分查找：

前提该集合一定要有序。

```Java
int binarySearch(list,key);
//必须根据元素自然顺序对列表进行升级排序
//要求list 集合中的元素都是Comparable 的子类。
int binarySearch(list,key,Comparator);
```
2，对list集合进行排序。
```Java
sort(list); 
//对list进行排序,其实使用的事list容器中的对象的compareTo方法
sort(list,comaprator);
//按照指定比较器进行排序
```
3，对集合取最大值或者最小值。
```Java
max(Collection)
max(Collection,comparator)
min(Collection)
min(Collection,comparator)
```
4，对list集合进行反转。
```Java
reverse(list);
```
5，对比较方式进行强行逆转。
```Java
Comparator reverseOrder();
Comparator reverseOrder(Comparator);
```
6，对list集合中的元素进行位置的置换。
```Java
swap(list,x,y);
```
7，对list集合进行元素的替换。如果被替换的元素不存在，那么原集合不变。
```Java
replaceAll(list,old,new);
```
8，可以将不同步的集合变成同步的集合。
```Java
Set synchronizedSet(Set<T> s)
Map synchronizedMap(Map<K,V> m)
List synchronizedList(List<T> list)
```
 如果想要将集合变数组：  
 
可以使用Collection 中的toArray 方法。注意：是Collection不是Collections工具类
传入指定的类型数组即可，该数组的长度最好为集合的size。


## 具体的集合

| 集合类型 | 描述  |
| --------- | ---------- |
| ArrayList | 一种可以动态增长和缩减的索引序列  |
| LinkedList | 一种可以在任何位置进行高效地插入和删除操作的有序序列 |
| ArrayDeque| 一种用循环数组实现的双端队列 |
| HashSet | 一种没有重复元素的无序集合 |
| TreeSet | 一种有序集 |
| EnumSet | 一种包含枚举类型值的集 |
| LinkedHashSet | 一种可以记住元素插入次序的集 |
| PriorityQueue | 一种允许高效删除最小元素的集合 |
| HashMap | 一种存储键/值关联的数据结构 |
| TreeMap | 一种键值有序排列的映射表 |
| EnumMap | 一种键值属于枚举类型的映射表 |
| LinkedHashMap | 一种可以记住键/值项添加次序的映射表 |
| WeakHashMap | 一种其值无用武之地后可以被垃圾回收器回收的映射表 |
| IdentityHashMap | 一种用==而不是用equals比较键值的映射表 |
