---
title: 校内ccpc选拔赛K题
published: 2026-11-25
description: 并查集在图论中的一种应用类型
tags: [算法, 学习笔记]
category: 错题本
lang: "zh-CN"
draft: false
---

> 死磕了半天不会解（）

> CCPC的精髓就是如何让两个大佬队友带飞我（误）

## 题目描述

小欧正在扮演一个中世纪的皇帝。地图上有 𝑛 个城市，其中有 𝑚 条道路，每条道路连接了两个城市。

小欧占领了其中一些城市。如果两个城市可以通过若干条道路互相到达，且这些道路经过的城市都是小欧占领的，那么这两个城市之间就可以通过经商获得1点收益。请注意，每两个城市之间的收益只会被计算一次。

现在，小欧准备占领一个未被占领的城市，使得总收益最大化。你能帮帮她吗？

## 输入描述：

第一行输入两个正整数 n,m (1 ≤ n,m ≤ 10^5)，代表城市数量和道路数量。

第二行输入一个长度为 n 的 01 串。第 i 个字符为 '0'，代表小欧未占领该城市，'1' 代表小欧已经占领了该城市。

接下来的 m 行，每行输入两个正整数 u,v (1 ≤ u,v ≤ n, u ≠ v)，代表城市 u 和城市 v 有一条道路连接。

## 输出描述：

输出一行两个空格隔开的整数，第一个整数代表占领的城市编号，第二个整数代表占领后的收益。

请保证收益的最大化。如果有多种方案收益最大，小欧会优先占领编号最小的城市。

## 题目分析

+ 1.注意到，当多个被占领的城市相互连接时，连接这几个城市中的任意一个，收益都是等效的。

那么这里就可以想到用[并查集](/posts/Union-Find/)维护连通块信息，来实现动态的缩点
```cpp 并查集缩点
scanf("%d%d", &u, &v);
if (vis[u] && vis[v]) { //判断两个城市是否都被占领
    merge(u, v); //是的话并入一个并查集内
}
else {
    add(u, v); //不是的话用图进行储存
    add(v, u);
}
```
+ 2.接下来考虑如何计算占领一个城市后产生的价值：

当k个城市联通时，注意到任意两个城市配对都会产生1点收益，总收益为：
$$
C_k^2 = \frac{k(k-1)}{2}
$$
假设有两个连通块，大小分别为\(a\)和\(b\) 。

当占领一个城市，导致两个连通块被联通时，产生的收益就是\(a+b+1\)个城市联通的总收益\(-\)两个连通块原本的收益

即该未联通城市的价值\(= C_(a+b+1)^2-C_(a)^2-C_(b)^2 = a*b+a+b\)

所以我们只要统计每一个未被占领的节点，然后通过查询它连接的节点所在的并查集来计算价值就可以了

~~完结撒花~~

+ 3.还有一件事

当一个未被占领的城市连接的多个城市v1,v2,v3...都在同一个并查集内时，不能重复计算这个连通块的收益。也就是说除了当前城市和它直接连接的城市外，不会有其他城市产生收益

通常我们会用一个 bool 数组标记是否访问过该连通块，但这次我们要枚举多个城市，每次枚举前`memset`会导致时间复杂度退化到 \(O(n^2)\)

这里我们引入时间戳。设变量`stamp`表示当前时间，每次枚举到新城市时`stamp++`，通过`mark[r]==stamp`来判断连通块\(r\)是否被计算过

AC代码如下：
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

#define up(l, r, i) for(int i = l, END##i = r; i <= END##i; ++i)
#define N 100010
#define M N << 2

// --- 链式前向星建图 ---
int head[N], ver[M], nxt[M], tot;
inline void add(int u, int v) {
    nxt[++tot] = head[u];
    ver[tot] = v;
    head[u] = tot;
}
inline void head_init() {
    tot = -1;
    memset(head, -1, sizeof(head));
}

// --- 并查集 ---
ll n, m, father[N];
void init() {
    up(1, n, i) father[i] = i;
}
inline ll find(ll x) {
    if (father[x] == x) return x;
    return father[x] = find(father[x]); // 路径压缩
}
inline void merge(ll x, ll y) {
    father[find(x)] = find(y);
}

int vis[N], mark[N];
ll sz[N]; // sz[i] 记录以 i 为根的连通块大小

int main() {
    head_init();
    scanf("%lld%lld", &n, &m);
    
    queue<int> q; // 用于存放所有未占领的城市
    char s[N];
    scanf("%s", s + 1);
    up(1, n, i) {
        vis[i] = s[i] - '0';
        if (vis[i] == 0) q.push(i);
    }
    
    init(); // 初始化并查集
    
    // --- 按需建边 ---
    up(1, m, i) {
        int u, v;
        scanf("%d%d", &u, &v);
        if (vis[u] && vis[v]) {
            merge(u, v); // 都已占领，直接合并
        } else {
            add(u, v);   // 含有未占领，建边
            add(v, u);
        }
    }
    
    // --- 计算当前的基础收益 (base) ---
    up(1, n, i) if (vis[i]) sz[find(i)]++; // 统计已占领连通块的大小
    ll base = 0;
    up(1, n, i) if (sz[i] > 0) base += sz[i] * (sz[i] - 1) / 2;
    
    // --- 枚举未占领城市，计算最大增量 ---
    int stamp = 0; // 时间戳，用于代替 memset 去重
    ll ans = -1, ansi = -1;
    
    while (!q.empty()) {
        int u = q.front(); q.pop(); // 取出一个未占领城市
        stamp++; 
        
        ll sum = 0;    // 记录连通的旧连通块原本的收益之和
        ll total = 1;  // 记录合并后的新连通块总大小（初始为 u 自己）
        
        // 遍历 u 的所有邻居
        for (int i = head[u]; ~i; i = nxt[i]) {
            int v = ver[i];
            if (!vis[v]) continue; // 邻居未被占领，无效
            
            int r = find(v); // 找到已占领邻居所在连通块的根
            
            // 如果这个连通块在本次枚举中未被计算过
            if (mark[r] != stamp) {
                mark[r] = stamp; // 打上时间戳标记
                total += sz[r];
                sum += sz[r] * (sz[r] - 1) / 2; // 累加旧的收益
            }
        }
        
        // 计算增量
        ll delta = total * (total - 1) / 2 - sum;
        
        // 顺序枚举，故遇到更大的才更新，保证同分时取最小 ID
        if (delta > ans) {
            ans = delta;
            ansi = u;
        }
    }
    
    // 输出编号 和 (基础收益 + 最大增量)
    printf("%lld %lld\n", ansi, base + ans);
    return 0;
}
```