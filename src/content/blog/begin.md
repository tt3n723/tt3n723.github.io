---
title: "新的开始"
description: "2022 年 5 月 4 日，我产生了建立了个人博客的想法，希望能记录一点东西，多年以后回想起来，不会觉得虚度光阴，这几年来，博客断断续续也更新了许多，但是由于我的完美主义，认为之前写的东西不算很好，…"
pubDate: 2025-05-04T21:00:00+08:00
tags: []
categories: []
cover: "/img/begin.jpg"
---
2022 年 5 月 4 日，我产生了建立了个人博客的想法，希望能记录一点东西，多年以后回想起来，不会觉得虚度光阴，这几年来，博客断断续续也更新了许多，但是由于我的完美主义，认为之前写的东西不算很好，于是几乎全部删掉重写，说实话，有些后悔，虽然还有一些痕迹，但总觉得自己的一部分消失了，再也找不回了。

这几年也经历了许多事情，碌碌无为，一事无成，而且我还是浑浑噩噩，没有找到一个事物来消耗我的所有热情，总是渴望活在别人的生活里，借此逃离自己的生活。每天都会浪费很多时间在无意义的人与事，找不到活着的意义。

人生是用来体验的，不是用来演绎完美的。我也没有什么伟大的理想，只想做我喜欢的事，把时间分给对这个世界的热爱，以及永远铭记生活的美好。所以请好好努力，哪怕一个人，也要寂寞又精彩。希望通过这个博客，留下一些有意义，值得回顾的东西。

```c++
#include <bits/stdc++.h>

#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace std;
using ll = long long;
typedef __gnu_pbds::tree<pair<int, int>, __gnu_pbds::null_type,
                         less<pair<int, int>>, __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    ordered_set;
const int INF = 0x3f3f3f3f;
const ll INFLL = 0x3f3f3f3f3f3f3f3fLL;

#define SEP (f ? (f = 0, "") : ", ")
template <class T>
void _dbg(const T& x) {
    if constexpr (requires { x.first, x.second; })
        cerr << "(", _dbg(x.first), cerr << ", ", _dbg(x.second), cerr << ")";
    else if constexpr (requires { x.begin(), x.end(); } &&
                       !is_same_v<T, string>) {
        bool f = 1;
        constexpr bool m = requires { typename T::mapped_type; };
        cerr << (m ? "{" : "[");
        for (auto&& e : x)
            if constexpr (m)
                cerr << SEP << e.first << ": ", _dbg(e.second);
            else
                cerr << SEP, _dbg(e);
        cerr << (m ? "}" : "]");
    } else
        cerr << x;
}
template <class... T>
void _p(const T&... x) {
    bool f = 1;
    ((cerr << SEP, _dbg(x)), ...);
    cerr << "\n";
}
#define dbg(...) (cerr << #__VA_ARGS__ << " = ", _p(__VA_ARGS__))

void solve() {
    
}

signed main() {
    ios::sync_with_stdio(false), cin.tie(nullptr);
    int T = 1;
    // cin >> T;
    while (T--) solve();
    return 0;
}
```
