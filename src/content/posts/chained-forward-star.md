---
title: 链式前向星
published: 2026-10-31
description: 一种比较好用的存图方法。
tags: [算法，学习笔记]
category: 算法笔记
lang: "zh-CN"
draft: false
---

链式前向星的本质是**用静态数组模拟邻接表**，为每个点维护一个“出边链表”

**优点**：
+ 时间复杂度为O(n+m) 
+ 能天然处理重边
+ 便于储存，遍历反图
**缺点**：
+ 代码繁琐，比较耗时
+ 链式结构导致删边步骤繁琐
+ 不能 O(1) 查询任意两点间是否有边/边权
+ 不能直接得到某个点的度数，需要额外统计或遍历计数。

**代码实现**：
```cpp
#include<bits/stdc++.h>
using namesapce std;
#define N 10000010
#define M N<<2  //部分数组的大小需要开到N*4

int head[N]; //head[u]为以u为起点的加入的最后一条边的下标（链表头指针） ，head[u]=i表示点u的第一条出边为存入的第i条边
int rhead[N]; //反图，哪些边指向u
int tot;//当前已经分配到第几条边

int nxt[M]; //同起点的下一条边的编号
int ver[M]; //这条边的终点
int edge[M]; //这条边的边权
/*
此处也可以用结构体：
struct edge {
	int nxt,ver,w;
} e[M];
*/

inline void init() { //初始化
	memset(head, -1, sizeof(head));
	memset(rhead, -1, sizeof(rhead));
	tot = -1;
}

inline void add(int h[], int u, int v, int w) {
	nxt[++tot] = h[u]; //新边指向原来的链表头
	ver[tot] = v;
	edge[tot] = w;
	h[u] = tot;
}

int main() {
	init();
	int n;
	scanf("%d", &n);
	for(int i=0; i<n; i++) {
		int u, v, w;
		scanf("%d%d%d", &u, &v, &w);
		add(head,u,v,w);
		add(rhead,v,u,w);
	}
	
	//遍历U的所有出边
	for(int i=head[u];~i;i=nxt[i]) {
		//...
		printf("")
	}
}
```