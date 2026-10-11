---
title: "CSES 技巧与构造"
description: "本篇包含：Advanced Techniques（25 题）、Interactive Problems（6 题）、Bitwise Operations（11 题）、Construction Probl…"
pubDate: 2026-05-06T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/17.jpg"
---
本篇包含：Advanced Techniques（25 题）、Interactive Problems（6 题）、Bitwise Operations（11 题）、Construction Problems（8 题）。共 50 题



## Advanced Techniques

### Meet in the Middle


**题目大意**：给定 `n` 个数与目标值 `x`（$n \le 40$，每个数非负），统计有多少个子集（下标集合）的元素和恰为 `x`。

**解题思路**：直接枚举全部 $2^n$ 个子集和无法承受，利用 $2^{40}\approx 10^{12}$ 远大于 $2^{20}\approx 10^6$：把数组分成前 `n1 = n / 2` 个与后 `n2 = n - n1` 个两半，分别枚举两半的全部子集和，只保留和不超过 `x` 的（所有数非负，超出 `x` 的和加上任意元素后只会更大），得到 `s1`、`s2`；把 `s2` 排序后，对 `s1` 中的每个和 `v`，用 `upper_bound - lower_bound` 统计 `s2` 中恰为 `x - v` 的个数并累加——这样做同时覆盖了「两半都取非空子集」与「只有一半参与」的情形。时间复杂度为 $O(2^{n/2}\log 2^{n/2})$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    ll x;
    cin >> n >> x;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    int n1 = n / 2, n2 = n - n1;
    vector<ll> s1, s2;
    for (int m = 0; m < (1 << n1); m++) {
        ll s = 0;
        for (int i = 0; i < n1; i++)
            if (m >> i & 1)
                s += a[i];
        if (s <= x)
            s1.push_back(s);
    }
    for (int m = 0; m < (1 << n2); m++) {
        ll s = 0;
        for (int i = 0; i < n2; i++)
            if (m >> i & 1)
                s += a[n1 + i];
        if (s <= x)
            s2.push_back(s);
    }
    sort(s2.begin(), s2.end());
    ll ans = 0;
    for (ll v : s1) {
        ans += upper_bound(s2.begin(), s2.end(), x - v) -
               lower_bound(s2.begin(), s2.end(), x - v);
    }
    cout << ans << '\n';
}
```

:::

### Hamming Distance


**题目大意**：给定 `n` 个长度为 `m` 的 01 串（$n \le 10^4$，$m \le 30$），求两两之间的最小汉明距离（等长串中对应位不同的个数）。

**解题思路**：把每个串压成整数掩码 `bits[i]`（第 `j` 位对应第 `j` 个字符），两串的汉明距离即 `__builtin_popcountll(bits[i] ^ bits[j])`。两个剪枝：读入时用 `unordered_set` 判重，一旦出现重复串答案直接输出 0；枚举数对时按 `best > 1` 控制循环，`best` 降到 1（两个不同串的汉明距离不可能更小）即提前终止。时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<unsigned long long> bits(n, 0);
    unordered_set<unsigned long long> seen;
    bool dup = false;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        for (int j = 0; j < m; j++)
            if (s[j] == '1')
                bits[i] |= 1ULL << j;
        if (!seen.insert(bits[i]).second)
            dup = true;
    }
    if (dup) {
        cout << 0 << '\n';
        return;
    }
    int best = m;
    for (int i = 0; i < n && best > 1; i++)
        for (int j = i + 1; j < n; j++)
            best = min(best, __builtin_popcountll(bits[i] ^ bits[j]));
    cout << best << '\n';
}
```

:::

### Corner Subgrid Check


**题目大意**：给定 $n\times n$ 的字母网格，对字母表中前 `k` 个字母逐一判断：是否存在一个宽、高都至少为 2 的子矩形，使它的四个角上都是该字母。对每个字母输出一行 `YES` 或 `NO`。

**解题思路**：

- **观察**：四角同为字母 `c` 的矩形等价于「存在两行，它们都有字母 `c`，且至少有两列同时是 `c`」——这两行与那两列就是矩形的两对边，宽高都至少为 2。于是问题化为：在字母 `c` 的行集合中，是否存在两行共享至少两个列。

- **做法**：预处理 `cols[c][i]`（第 `i` 行字母 `c` 所在列）与行 bitset `bs[c][i]`，并统计字母 `c` 在两行上的出现总次数 `total` 与「行内列对数」之和 `pairs`（第 `i` 行有 $sz$ 个 `c` 就贡献 $sz(sz-1)/2$ 对）。`total < 4` 时直接输出 `NO`。`pairs` 不超过 4500000 时用稀疏桶法：枚举每行的每个列对 `(x, y)`（`x < y`）把 `y` 放进桶 `bucket[x]`；再用时间戳 `mark` 扫一遍桶，同一个桶里出现两次 `y` 就说明第 `y` 列与第 `x` 列同时在两行中是 `c`，找到答案，时间戳机制免去了每轮清空桶的开销，逐个字母处理后统一 `clear`。`pairs` 超过阈值时列对太多、无法枚举，由鸽巢原理必有重复列对：直接枚举行对 `(i, j)`，用 `__builtin_popcountll(bs[c][i][w] & bs[c][j][w])` 逐词累加，一旦达到 2 即找到。

- **正确性**：稀疏桶法与 bitset 法都在判定「两行是否共享两个 `c` 列」这一等价条件。稀疏桶法的时间为 $O(\text{pairs})$，受阈值约束；bitset 法为 $O(k\cdot n^2/64)$。总时间复杂度为 $O(k\cdot n^2/64)$ 级别。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
void solve() {
    int n, k;
    cin >> n >> k;
    vector<string> grid(n);
    for (auto& r : grid) cin >> r;
    const int W = (n + 63) / 64;
    vector<vector<vector<int>>> cols(26, vector<vector<int>>(n));
    vector<vector<vector<ull>>> bs(26,
                                   vector<vector<ull>>(n, vector<ull>(W, 0)));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            int c = grid[i][j] - 'A';
            cols[c][i].push_back(j);
            bs[c][i][j >> 6] |= 1ULL << (j & 63);
        }
    vector<vector<int>> bucket(n);
    vector<int> mark(n, 0);
    int tnow = 0;
    string out;
    for (int c = 0; c < k; c++) {
        ll total = 0, pairs = 0;
        for (int i = 0; i < n; i++) {
            int sz = (int)cols[c][i].size();
            total += sz;
            pairs += 1LL * sz * (sz - 1) / 2;
        }
        if (total < 4) {
            out += "NO\n";
            continue;
        }
        bool found = false;
        if (pairs <= 4500000LL) {
            for (int i = 0; i < n && !found; i++) {
                auto& P = cols[c][i];
                int sz = (int)P.size();
                for (int a = 0; a < sz && !found; a++)
                    for (int b = a + 1; b < sz; b++) {
                        int x = P[a], y = P[b];
                        if (x > y)
                            swap(x, y);
                        bucket[x].push_back(y);
                    }
            }
            if (!found) {
                for (int x = 0; x < n && !found; x++) {
                    auto& B = bucket[x];
                    if (B.empty())
                        continue;
                    tnow++;
                    for (int y : B) {
                        if (mark[y] == tnow) {
                            found = true;
                            break;
                        }
                        mark[y] = tnow;
                    }
                }
            }
            for (int x = 0; x < n; x++) bucket[x].clear();
        } else {
            for (int i = 0; i < n && !found; i++) {
                bool anyI = false;
                for (int w = 0; w < W; w++)
                    if (bs[c][i][w]) {
                        anyI = true;
                        break;
                    }
                if (!anyI)
                    continue;
                for (int j = i + 1; j < n && !found; j++) {
                    ll cnt = 0;
                    for (int w = 0; w < W; w++) {
                        cnt += __builtin_popcountll(bs[c][i][w] & bs[c][j][w]);
                        if (cnt >= 2)
                            break;
                    }
                    if (cnt >= 2)
                        found = true;
                }
            }
        }
        out += found ? "YES\n" : "NO\n";
    }
    cout << out;
}
```

:::

### Corner Subgrid Count


**题目大意**：给定 $n\times n$ 的 01 网格（$n \le 3000$），统计四个角全是 1 且宽、高都至少为 2 的子矩形个数。

**解题思路**：枚举行对 `(i, j)`，用 bitset 求两行同时为 1 的列集合：把两行的每个 `ull` 词做 AND 后累加 `__builtin_popcountll`，得到共同为 1 的列数 `cnt`；从这 `cnt` 列中任选两列都能与第 `i`、`j` 行一起构成一个四角为 1 的矩形，贡献 $\binom{cnt}{2}$。行 bitset 用 `ull` 数组实现（`W = (n + 63) / 64` 个词），每对行的 AND 为 $O(n/64)$，行对共 $O(n^2)$ 个。时间复杂度为 $O(n^3/64)$，空间复杂度为 $O(n^2/64)$。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
void solve() {
    int n;
    cin >> n;
    const int W = (n + 63) / 64;
    vector<vector<ull>> rows(n, vector<ull>(W, 0));
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        for (int j = 0; j < n; j++)
            if (s[j] == '1')
                rows[i][j >> 6] |= 1ULL << (j & 63);
    }
    ll ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            ll cnt = 0;
            for (int w = 0; w < W; w++)
                cnt += __builtin_popcountll(rows[i][w] & rows[j][w]);
            ans += cnt * (cnt - 1) / 2;
        }
    cout << ans << '\n';
}
```

:::

### Reachable Nodes


**题目大意**：给定 `n` 个节点、`m` 条边的有向图（$n \le 5 \times 10^4$），对每个节点求出它能到达的节点数（含自身）。

**解题思路**：

- **观察**：先 Tarjan 缩点成 DAG；同一 SCC 内节点互相可达，于是只需在 DAG 上求每个分量能到达的分量集合，再按分量大小折算。直接为每个分量开 $n$ 位 bitset 需要 $O(c^2/64)$ 词，内存过大，改为**按目标分块**：块大小 `B = 4096`，每块只回答「能到达块内哪些节点」，一个块只需 $B/64$ 个 `ull` 词。

- **做法**：把分量按拓扑序存入 `topo`。对每块 `blk`，先清空 `dp`，再按拓扑逆序处理分量 `v`：先把每个后继分量的 $B$ 位集合 OR 进 `dp[v]`，若 `v` 落在当前块内，再把自己的位置位。该块处理完后，对每个原节点 `u` 统计其所在分量的 `dp` 中 1 的个数（`popcount` 累加）——这恰是 `u` 在第 `blk` 块内能到达的节点数，把 $c/64$ 个块的统计结果相加即为答案。`dp` 共 $c\times64$ 个词，约 $c\times512$ 字节。

- **正确性**：拓扑逆序保证处理 `v` 时所有后继分量已算完；同一 SCC 内节点互相可达，故按分量统计等价于按节点统计。块内下标 `v - blk` 落在 $[0,B)$，最后一块不足 $B$ 时由 `v < blk + B` 判断自然处理，不越界。总时间复杂度为 $O((n+m)\cdot c/64)$，空间复杂度为 $O(c\cdot B/64)$ 个 `ull` 词。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
    }

    typedef unsigned long long ull;
    vector<int> disc(n, -1), low(n), stk, comp(n, -1), compSize;   // compSize[c] = 第 c 个分量的点数
    vector<bool> inStk(n, false);
    int timer = 0, compCnt = 0;
    function<void(int)> dfs = [&](int v) {
        disc[v] = low[v] = timer++;
        stk.push_back(v);
        inStk[v] = true;
        for (int to : g[v]) {
            if (disc[to] == -1) {
                dfs(to);
                low[v] = min(low[v], low[to]);
            } else if (inStk[to])
                low[v] = min(low[v], disc[to]);
        }
        if (low[v] == disc[v]) {
            int sz = 0;
            while (true) {
                int x = stk.back();
                stk.pop_back();
                inStk[x] = false;
                comp[x] = compCnt;
                sz++;
                if (x == v)
                    break;
            }
            compSize.push_back(sz);
            compCnt++;
        }
    };
    for (int i = 0; i < n; i++)
        if (disc[i] == -1)
            dfs(i);
    int c = compCnt;
    vector<vector<int>> dag(c);
    vector<int> indeg(c, 0);
    for (int v = 0; v < n; v++)
        for (int to : g[v])
            if (comp[v] != comp[to]) {
                dag[comp[v]].push_back(comp[to]);
                indeg[comp[to]]++;
            }
    queue<int> q;
    for (int i = 0; i < c; i++)
        if (indeg[i] == 0)
            q.push(i);
    vector<int> topo;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        topo.push_back(v);
        for (int to : dag[v])
            if (--indeg[to] == 0)
                q.push(to);
    }

    const int B = 4096;
    const int W = B / 64;
    vector<ll> ans(n, 0);
    vector<ull> dp((size_t)c * W, 0);
    for (int blk = 0; blk < c; blk += B) {
        fill(dp.begin(), dp.end(), 0);
        for (int idx = c - 1; idx >= 0; idx--) {
            int v = topo[idx];
            ull* dv = &dp[(size_t)v * W];
            for (int to : dag[v]) {
                ull* dt = &dp[(size_t)to * W];
                for (int w = 0; w < W; w++) dv[w] |= dt[w];
            }
            if (v >= blk && v < blk + B)
                dv[(v - blk) / 64] |= 1ULL << ((v - blk) % 64);
        }
        for (int u = 0; u < n; u++) {
            ull* du = &dp[(size_t)comp[u] * W];
            ll cnt = 0;
            for (int w = 0; w < W; w++) cnt += __builtin_popcountll(du[w]);
            ans[u] += cnt;
        }
    }
    for (int i = 0; i < n; i++) cout << ans[i] << ' ';
    cout << '\n';
}
```

:::

### Reachability Queries


**题目大意**：给定有向图与 `q` 次询问（$n \le 5 \times 10^4$），每次询问点 `a` 能否到达点 `b`，对每次询问输出 `YES` 或 `NO`。

**解题思路**：

- **观察**：先 Tarjan 缩点成 DAG 并拓扑排序；询问 `a → b` 等价于「`a` 所在分量能否到达 `b` 所在分量」。答案只有 0/1 两种取值，故可以用一个 `ull` 词同时承载 64 个目标分量：把询问按目标分量挂到 `byTarget`，每 64 个目标分量做一次反向拓扑 DP。

- **做法**：对每块 64 个目标分量 `[blk, blk + 64)`，清空 `dp` 后按拓扑逆序处理分量 `v`：先把所有后继的 `dp` OR 进 `dp[v]`，若 `v` 在本块内则把自己的位 `1 << (v - blk)` 置位；随后遍历挂在块内目标 `t` 上的询问，答案即「起点分量 `dp` 的第 `t - blk` 位是否为 1」。

- **正确性**：`dp[v]` 的第 `j` 位为 1 当且仅当 `v` 能到达本块第 `j` 个目标；拓扑逆序保证转移时后继已算完。总时间复杂度为 $O((n+m+q)\cdot c/64)$，空间复杂度为 $O(c)$ 个 `ull` 词。

:::details[题解(C++)]

```c++
void solve() {
    int n, m, q;
    cin >> n >> m >> q;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
    }
    vector<pair<int, int>> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i].first >> qs[i].second;
        qs[i].first--;
        qs[i].second--;
    }

    typedef unsigned long long ull;
    vector<int> disc(n, -1), low(n), stk, comp(n, -1);
    vector<bool> inStk(n, false);
    int timer = 0, compCnt = 0;
    function<void(int)> dfs = [&](int v) {
        disc[v] = low[v] = timer++;
        stk.push_back(v);
        inStk[v] = true;
        for (int to : g[v]) {
            if (disc[to] == -1) {
                dfs(to);
                low[v] = min(low[v], low[to]);
            } else if (inStk[to])
                low[v] = min(low[v], disc[to]);
        }
        if (low[v] == disc[v]) {
            while (true) {
                int x = stk.back();
                stk.pop_back();
                inStk[x] = false;
                comp[x] = compCnt;
                if (x == v)
                    break;
            }
            compCnt++;
        }
    };
    for (int i = 0; i < n; i++)
        if (disc[i] == -1)
            dfs(i);
    int c = compCnt;
    vector<vector<int>> dag(c);
    vector<int> indeg(c, 0);
    for (int v = 0; v < n; v++)
        for (int to : g[v])
            if (comp[v] != comp[to]) {
                dag[comp[v]].push_back(comp[to]);
                indeg[comp[to]]++;
            }
    queue<int> qu;
    for (int i = 0; i < c; i++)
        if (indeg[i] == 0)
            qu.push(i);
    vector<int> topo;
    while (!qu.empty()) {
        int v = qu.front();
        qu.pop();
        topo.push_back(v);
        for (int to : dag[v])
            if (--indeg[to] == 0)
                qu.push(to);
    }

    vector<vector<pair<int, int>>> byTarget(c);
    for (int i = 0; i < q; i++)
        byTarget[comp[qs[i].second]].push_back({comp[qs[i].first], i});
    vector<string> ans(q);
    vector<ull> dp(c, 0);

    const int B = 64;
    for (int blk = 0; blk < c; blk += B) {
        fill(dp.begin(), dp.end(), 0);
        for (int idx = c - 1; idx >= 0; idx--) {
            int v = topo[idx];
            for (int to : dag[v]) dp[v] |= dp[to];
            if (v >= blk && v < blk + B)
                dp[v] |= 1ULL << (v - blk);
        }
        for (int t = blk; t < min(c, blk + B); t++) {
            ull mask = 1ULL << (t - blk);
            for (auto [s, id] : byTarget[t])
                ans[id] = (dp[s] & mask) ? "YES" : "NO";
        }
    }
    for (auto& s : ans) cout << s << '\n';
}
```

:::

### Cut and Paste


**题目大意**：给定长度 `n` 的字符串（$n \le 5 \times 10^5$）与 `m` 次操作（$m \le 2 \times 10^5$）：把子串 `[a, b]`（下标从 1 开始）剪下并拼接到字符串末尾。输出全部操作后的字符串。

**解题思路**：用 fhq Treap 维护序列，每个节点存字符、随机优先级与子树大小。一次剪切粘贴 = 三次 `split` + 两次 `merge`：`split(root, a - 1, A, B)` 分出前 `a - 1` 个字符，`split(B, b - a + 1, mid, C)` 分出子串 `[a, b]` 与剩余后缀，再 `merge(merge(A, C), mid)` 把 `[a, b]` 接到末尾（`a = 1` 或 `b = n` 时对应子树为空，`merge` 会直接返回另一侧）。全部操作后中序遍历收集字符输出。时间复杂度为 $O((n+m)\log n)$。

:::details[题解(C++)]

```c++
struct Node {
    char c;
    unsigned pri;
    int sz;
    Node *l, *r;
    Node(char ch)
        : c(ch), pri(rand() << 16 ^ rand()), sz(1), l(nullptr), r(nullptr) {}
};
int sz(Node* t) { return t ? t->sz : 0; }
void upd(Node* t) {
    if (t)
        t->sz = 1 + sz(t->l) + sz(t->r);
}
Node* merge(Node* a, Node* b) {
    if (!a)
        return b;
    if (!b)
        return a;
    if (a->pri < b->pri) {
        a->r = merge(a->r, b);
        upd(a);
        return a;
    }
    b->l = merge(a, b->l);
    upd(b);
    return b;
}
void split(Node* t, int k, Node*& a, Node*& b) {
    if (!t) {
        a = b = nullptr;
        return;
    }
    if (sz(t->l) >= k) {
        split(t->l, k, a, t->l);
        b = t;
        upd(b);
    } else {
        split(t->r, k - sz(t->l) - 1, t->r, b);
        a = t;
        upd(a);
    }
}
void collect(Node* t, string& out) {
    if (!t)
        return;
    collect(t->l, out);
    out += t->c;
    collect(t->r, out);
}
void solve() {
    srand(12345);
    int n, m;
    cin >> n >> m;
    string s;
    cin >> s;
    Node* root = nullptr;
    for (char c : s) root = merge(root, new Node(c));
    while (m--) {
        int a, b;
        cin >> a >> b;
        Node *A, *B, *C, *mid;
        split(root, a - 1, A, B);
        split(B, b - a + 1, mid, C);
        root = merge(merge(A, C), mid);
    }
    string out;
    collect(root, out);
    cout << out << '\n';
}
```

:::

### Substring Reversals


**题目大意**：给定长度 `n` 的字符串（$n, m \le 2 \times 10^5$），执行 `m` 次操作，每次反转子串 `[l, r]`。输出全部操作后的字符串。

**解题思路**：

- **观察**：区间反转是「整棵子树镜像」的操作，不需要逐元素处理，用带 `flip` 懒标记的 Splay 把区间整段提出后打标记即可，区间可像单个节点一样在 $O(\log n)$ 摊还时间内被「提」到指定位置。

- **做法**：序列外层加两个哨兵节点（首尾），建树得到初始结构；每次操作先 `RotateTo(l - 1, 0)` 把 `l - 1` 旋到根，再 `RotateTo(r + 1, root)` 把 `r + 1` 旋到根的右孩子，此时 `[l, r]` 恰是根的右孩子的左子树 `Key_Tree`（空区间时为空节点），对它调用 `Update_Flip` 交换左右儿子并给 `flip` 打上标记，之后由 `Push_Down` 逐层下传。全部操作后对每个位置查询 `Min(i, i)` 还原字符。

- **边界**：`minx[0] = INF` 保证空子树的 `min` 不干扰结果；反转只改变节点之间的相对次序、不改变每个位置的键值，故单点 `Min(i, i)` 查询得到的仍是该位置现在的字符。时间复杂度为 $O((n+m)\log n)$。

:::details[题解(C++)]

```c++
#define Key_Tree ch[ch[root][1]][0]
#define MAXN 550000
int n, m;
int num[MAXN];
struct SplayTree {
    int ch[MAXN][2], sz[MAXN], s[MAXN], pre[MAXN], key[MAXN], root, tot1, tot2,
        add[MAXN], minx[MAXN];
    int flip[MAXN];

    void Rotate(int x, int kind) {
        int y = pre[x];
        Push_Down(y);
        Push_Down(x);
        ch[y][!kind] = ch[x][kind];
        pre[ch[x][kind]] = y;
        if (pre[y]) {
            ch[pre[y]][ch[pre[y]][1] == y] = x;
        }
        pre[x] = pre[y];
        ch[x][kind] = y;
        pre[y] = x;
        Push_Up(y);
    }
    void Splay(int x, int goal) {
        Push_Down(x);
        while (pre[x] != goal) {
            Push_Down(pre[pre[x]]);
            Push_Down(pre[x]);
            Push_Down(x);
            if (pre[pre[x]] == goal) {
                Rotate(x, ch[pre[x]][0] == x);
            } else {
                int y = pre[x];
                int kind = (ch[pre[y]][0] == y);
                if (ch[y][kind] == x) {
                    Rotate(x, !kind);
                    Rotate(x, kind);
                } else {
                    Rotate(y, kind);
                    Rotate(x, kind);
                }
            }
        }
        Push_Up(x);
        if (!goal)
            root = x;
    }
    void RotateTo(int k, int goal) {
        int x = root;
        Push_Down(x);
        while (sz[ch[x][0]] != k) {
            if (k < sz[ch[x][0]]) {
                x = ch[x][0];
            } else {
                k -= (sz[ch[x][0]] + 1);
                x = ch[x][1];
            }
            Push_Down(x);
        }
        Splay(x, goal);
    }
    void NewNode(int& x, int father, int k) {
        if (tot2)
            x = s[tot2--];
        else
            x = ++tot1;
        pre[x] = father;
        minx[x] = key[x] = k;
        ch[x][0] = ch[x][1] = 0;
        add[x] = 0;
        sz[x] = 1;
        flip[x] = 0;
    }
    void Update_Add(int x, int value) {
        if (!x)
            return;
        add[x] += value;
        key[x] += value;
        minx[x] += value;
    }
    void Update_Flip(int x) {
        if (!x)
            return;
        swap(ch[x][0], ch[x][1]);
        flip[x] ^= 1;
    }
    void Push_Up(int x) {
        sz[x] = sz[ch[x][0]] + sz[ch[x][1]] + 1;
        minx[x] = min(min(minx[ch[x][0]], minx[ch[x][1]]), key[x]);
    }
    void Push_Down(int x) {
        if (add[x]) {
            Update_Add(ch[x][0], add[x]);
            Update_Add(ch[x][1], add[x]);
            add[x] = 0;
        }
        if (flip[x]) {
            Update_Flip(ch[x][0]);
            Update_Flip(ch[x][1]);
            flip[x] = 0;
        }
    }
    void Build(int& x, int l, int r, int father) {
        if (l > r)
            return;
        int mid = (l + r) >> 1;
        NewNode(x, father, num[mid]);
        Build(ch[x][0], l, mid - 1, x);
        Build(ch[x][1], mid + 1, r, x);
        Push_Up(x);
    }
    void Init() {
        minx[0] = INF;
        pre[0] = add[0] = sz[0] = 0;
        root = tot1 = tot2 = 0;
        NewNode(root, 0, INF);
        NewNode(ch[root][1], root, INF);
        sz[root] = 2;
        Build(Key_Tree, 0, n - 1, ch[root][1]);
        Push_Up(ch[root][1]);
        Push_Up(root);
    }
    void Add(int l, int r, int value) {
        RotateTo(l - 1, 0);
        RotateTo(r + 1, root);
        Update_Add(Key_Tree, value);
    }
    void Erase(int x) {
        if (!x)
            return;
        s[++tot2] = x;
        Erase(ch[x][0]);
        Erase(ch[x][1]);
    }
    void Insert(int x, int value) {
        RotateTo(x, 0);
        RotateTo(x + 1, root);
        NewNode(Key_Tree, ch[root][1], value);
        Push_Up(ch[root][1]);
        Push_Up(root);
    }
    void Delete(int x) {
        RotateTo(x - 1, 0);
        RotateTo(x + 1, root);
        Erase(Key_Tree);
        Key_Tree = 0;
        Push_Up(ch[root][1]);
        Push_Up(root);
    }
    void Reverse(int l, int r) {
        RotateTo(l - 1, 0);
        RotateTo(r + 1, root);
        Update_Flip(Key_Tree);
        Push_Up(ch[root][1]);
        Push_Up(root);
    }
    void Revolve(int l, int r, int k) {
        k = (k % (r - l + 1) + (r - l + 1)) % (r - l + 1);
        if (!k)
            return;
        RotateTo(l - 1, 0);
        RotateTo(r + 1, root);
        RotateTo(r - k, ch[root][1]);
        int y = ch[Key_Tree][1];
        pre[ch[Key_Tree][1]] = 0;
        ch[Key_Tree][1] = 0;
        Push_Up(Key_Tree);
        Push_Up(ch[root][1]);
        Push_Up(root);
        RotateTo(l, ch[root][1]);
        pre[y] = Key_Tree;
        ch[Key_Tree][0] = y;
        Push_Up(Key_Tree);
        Push_Up(ch[root][1]);
        Push_Up(root);
    }
    int Min(int l, int r) {
        RotateTo(l - 1, 0);
        RotateTo(r + 1, root);
        return minx[Key_Tree];
    }
    int Get_Pre(int x) {
        Push_Down(x);
        x = ch[x][0];
        while (x) {
            Push_Down(x);
            while (ch[x][1]) {
                x = ch[x][1];
                Push_Down(x);
            }
            return x;
        }
        return -1;
    }
    int Get_Next(int x) {
        Push_Down(x);
        x = ch[x][1];
        while (x) {
            Push_Down(x);
            while (ch[x][0]) {
                x = ch[x][0];
                Push_Down(x);
            }
            return x;
        }
        return -1;
    }
} spt;
string s;
void solve() {
    cin >> n >> m >> s;
    for (int i = 0; i <= n - 1; i++) num[i] = s[i] - 'A' + 1;
    spt.Init();
    for (int i = 1; i <= n; i++) spt.Add(i, i, num[i - 1]);
    while (m--) {
        int l, r;
        cin >> l >> r;
        spt.Reverse(l, r);
    }
    for (int i = 1; i <= n; i++) cout << char(spt.Min(i, i) / 2 + 'A' - 1);
    cout << '\n';
}
```

:::

### Reversals and Sums


**题目大意**：给定长度 `n` 的数组（$n, m \le 2 \times 10^5$），执行 `m` 次操作：类型 1 反转区间 `[l, r]`；类型 2 查询区间 `[l, r]` 的元素和。按顺序输出每次类型 2 查询的答案。

**解题思路**：用 fhq Treap 维护序列，节点存值 `v`、子树和 `sum`、大小 `sz` 与懒标记 `rev`。`split` 与 `merge` 之前先 `push` 下传标记（`push` 交换左右子树并把 `rev` 传给两个孩子，子树和不受反转影响、无需重算），这样标记只影响顺序、不影响求和。每次操作 `split(root, l, A, B)` 与 `split(B, r - l + 1, B, C)` 把 `[l, r]` 摘成子树 `B`：类型 1 对 `B` 的 `rev` 取反，类型 2 输出 `sum(B)`；随后 `merge(merge(A, B), C)` 合并回原序列。时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
struct Node {
    ll v, sum;
    unsigned pri;
    int sz, rev;
    Node *l, *r;
    Node(ll x)
        : v(x),
          sum(x),
          pri(rand() << 16 ^ rand()),
          sz(1),
          rev(0),
          l(nullptr),
          r(nullptr) {}
};
int sz(Node* t) { return t ? t->sz : 0; }
ll sum(Node* t) { return t ? t->sum : 0; }
void push(Node* t) {
    if (t && t->rev) {
        swap(t->l, t->r);
        if (t->l)
            t->l->rev ^= 1;
        if (t->r)
            t->r->rev ^= 1;
        t->rev = 0;
    }
}
void upd(Node* t) {
    if (t) {
        t->sz = 1 + sz(t->l) + sz(t->r);
        t->sum = t->v + sum(t->l) + sum(t->r);
    }
}
Node* merge(Node* a, Node* b) {
    if (!a)
        return b;
    if (!b)
        return a;
    if (a->pri < b->pri) {
        push(a);
        a->r = merge(a->r, b);
        upd(a);
        return a;
    }
    push(b);
    b->l = merge(a, b->l);
    upd(b);
    return b;
}
void split(Node* t, int k, Node*& a, Node*& b) {
    if (!t) {
        a = b = nullptr;
        return;
    }
    push(t);
    if (sz(t->l) >= k) {
        split(t->l, k, a, t->l);
        b = t;
        upd(b);
    } else {
        split(t->r, k - sz(t->l) - 1, t->r, b);
        a = t;
        upd(a);
    }
}
void solve() {
    srand(1234);
    int n, m;
    cin >> n >> m;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        root = merge(root, new Node(x));
    }
    while (m--) {
        int t, l, r;
        cin >> t >> l >> r;
        l--, r--;
        Node *A, *B, *C;
        split(root, l, A, B);
        split(B, r - l + 1, B, C);
        if (t == 1)
            B->rev ^= 1;
        else
            cout << sum(B) << '\n';
        root = merge(merge(A, B), C);
    }
}
```

:::

### Necessary Roads


**题目大意**：给定连通无向图（$n, m \le 10^5$），找出所有「必要道路」——删掉后图不再连通的边（割边，也称桥）。第一行输出边数，随后按输入顺序输出这些边的两个端点（按输入时的编号）。

**解题思路**：Tarjan 求桥。DFS 中给每个点记录发现时间 `tin` 与 `low`（不经过父边能回溯到的最早 `tin`）：对树边 `(v, to)`，若 `low[to] > tin[v]`，说明 `to` 的子树没有任何回边能绕到 `v` 或 `v` 的祖先，删掉该边即断开，它是桥。用边编号 `id` 跳过父边而不是用父节点——有重边时只跳过同一条边，平行边会被当作回边更新 `low`，从而正确判定两条平行边都不是桥。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> g(n);
    vector<pair<int, int>> edgeList(m);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        edgeList[i] = {a, b};
        g[a].push_back({b, i});
        g[b].push_back({a, i});
    }
    vector<int> tin(n, -1), low(n);
    vector<bool> isBridge(m, false);
    int timer = 0;
    function<void(int, int)> dfs = [&](int v, int pe) {
        tin[v] = low[v] = timer++;
        for (auto [to, id] : g[v]) {
            if (id == pe)
                continue;
            if (tin[to] != -1)
                low[v] = min(low[v], tin[to]);
            else {
                dfs(to, id);
                low[v] = min(low[v], low[to]);
                if (low[to] > tin[v])
                    isBridge[id] = true;
            }
        }
    };
    for (int i = 0; i < n; i++)
        if (tin[i] == -1)
            dfs(i, -1);
    vector<pair<int, int>> ans;
    for (int i = 0; i < m; i++)
        if (isBridge[i])
            ans.push_back({edgeList[i].first + 1, edgeList[i].second + 1});
    cout << ans.size() << '\n';
    for (auto& pr : ans) cout << pr.first << ' ' << pr.second << '\n';
}
```

:::

### Necessary Cities


**题目大意**：给定连通无向图（$n, m \le 10^5$），找出所有「必要城市」——删掉后图不再连通的点（割点）。第一行输出点数，随后按编号从小到大输出这些点。

**解题思路**：Tarjan 求割点。DFS 树中：非根节点 `v` 是割点，当且仅当存在一个孩子 `to` 满足 `low[to] >= tin[v]`——`to` 的子树回不到 `v` 的祖先，删掉 `v` 后它与上方断开；根节点是割点，当且仅当它在 DFS 树中至少有 2 个孩子（只有一个孩子时，删掉根剩下的部分仍连通）。代码在回溯时对每个满足条件的孩子把 `isArt[v]` 置真，并单独统计 `children`；回边用 `tin[to]` 而非 `low[to]` 更新 `low`。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    vector<int> tin(n, -1), low(n);
    vector<bool> isArt(n, false);
    int timer = 0;
    function<void(int, int)> dfs = [&](int v, int p) {
        tin[v] = low[v] = timer++;
        int children = 0;
        for (int to : g[v]) {
            if (to == p)
                continue;
            if (tin[to] != -1)
                low[v] = min(low[v], tin[to]);
            else {
                dfs(to, v);
                low[v] = min(low[v], low[to]);
                if (p != -1 && low[to] >= tin[v])
                    isArt[v] = true;
                children++;
            }
        }
        if (p == -1 && children > 1)
            isArt[v] = true;
    };
    for (int i = 0; i < n; i++)
        if (tin[i] == -1)
            dfs(i, -1);
    vector<int> ans;
    for (int i = 0; i < n; i++)
        if (isArt[i])
            ans.push_back(i + 1);
    cout << ans.size() << '\n';
    for (int v : ans) cout << v << ' ';
    cout << '\n';
}
```

:::

### Eulerian Subgraphs


**题目大意**：给定无向图（$n, m \le 10^5$），统计所有满足「每个点度数均为偶数」的边子集（欧拉子图）个数，对 $10^9+7$ 取模。

**解题思路**：

- **观察**：把每条边是否选取看作 GF(2) 上的变量，则每个点「度为偶」给出一个线性约束：该点相邻边的选取状态异或和为 0。DFS 数出连通分量数 `c` 后，约束矩阵的秩为 $n - c$：在每个连通块内，任意 $|V_i| - 1$ 个点的约束线性无关，而第 $|V_i|$ 个点的约束是它们的和——因为每条边恰贡献两个端点、其他点的度数都已是偶，第 $|V_i|$ 个点的度数也必为偶，故该约束可被推出而非独立。

- **做法**：自由变量数为 $m - (n - c)$，每个自由变量独立取 0/1，答案即 $2^{m-n+c}$，用快速幂或逐次乘 2 取模求出。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    vector<bool> vis(n, false);
    function<void(int)> dfs = [&](int v) {
        vis[v] = true;
        for (int to : g[v])
            if (!vis[to])
                dfs(to);
    };
    int c = 0;
    for (int i = 0; i < n; i++)
        if (!vis[i]) {
            c++;
            dfs(i);
        }
    ll ans = 1;
    for (int i = 0; i < m - (n - c); i++) ans = ans * 2 % MOD;
    cout << ans << '\n';
}
```

:::

### Monster Game I


**题目大意**：有 `n` 关怪物（$n \le 2 \times 10^5$），前 $n-1$ 关可以选择击杀或逃跑，最后一关必须击杀。击杀第 `i` 关耗时为 $s_i$ 乘以当前技能系数；击杀后技能系数变为 $f_i$。初始技能系数为 `x`。`s` 单调不减、`f` 单调不增。求通关的最小总耗时。

**解题思路**：

- **观察**：设 $dp[i]$ 为「最后一次击杀发生在第 `i` 关」的最小总耗时。要么从初始系数直接击杀第 `i` 关，耗时 $x\cdot s_i$；要么上一次击杀在第 $j < i$ 关，此后技能系数恒为 $f_j$，耗时 $dp[j] + f_j\cdot s_i$。于是
  $$
  dp[i]=\min\Big(x\cdot s_i,\ \min_{j<i}\bigl(dp[j]+f_j\cdot s_i\bigr)\Big).
  $$
  把每个已算出的 $j$ 看成一条直线 $y=f_j\cdot t+dp[j]$，一次转移就是对 $t=s_i$ 求所有直线的最小值。

- **做法**：用维护最小值的 Li Chao 树维护直线族。初始插入直线 `(x, 0)`；每关先 `qry` 出 $s_i$ 处的最小值作为当前 `dp`，再把直线 `(f[i], dp)` 插入值域 $[0,10^6]$——先查后插，避免同一关自己转移自己。Li Chao 树的插入与查询只依赖直线的取值比较，不需要直线按斜率有序，因此 `s`、`f` 的单调性在此解法中不必要（本题的数据保证 $s_i, f_i \le 10^6$，值域覆盖全部查询点）。时间复杂度为 $O(n\log M)$，其中 $M = 10^6$ 为值域，空间复杂度为 $O(M)$。

:::details[题解(C++)]

```c++
const ll BIG = 4e18;

struct Line {
    ll a, b;
    Line(ll a = 0, ll b = BIG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * 1000005];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) > f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) > f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) > f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return min(res, qry(node << 1, l, mid, x));
    return min(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n;
    ll x;
    cin >> n >> x;
    vector<ll> s(n), fv(n);
    for (auto& v : s) cin >> v;
    for (auto& v : fv) cin >> v;
    for (int i = 0; i < 4 * 1000005; i++) tr[i] = Line();
    add(1, 0, 1000000, Line(x, 0));
    ll dp = 0;
    for (int i = 0; i < n; i++) {
        dp = qry(1, 0, 1000000, (int)s[i]);
        add(1, 0, 1000000, Line(fv[i], dp));
    }
    cout << dp << '\n';
}
```

:::

### Monster Game II


**题目大意**：有 `n` 关怪物（$n \le 2 \times 10^5$），前 $n-1$ 关可以选择击杀或逃跑，最后一关必须击杀。击杀第 `i` 关耗时为 $s_i$ 乘以当前技能系数；击杀后技能系数变为 $f_i$。初始技能系数为 `x`。本题的 `s`、`f` 没有任何单调性约束，求通关的最小总耗时。

**解题思路**：

- **观察**：设 $dp[i]$ 为「最后一次击杀发生在第 `i` 关」的最小总耗时。要么从初始系数直接击杀第 `i` 关，耗时 $x\cdot s_i$；要么上一次击杀在第 $j < i$ 关，此后技能系数恒为 $f_j$，耗时 $dp[j] + f_j\cdot s_i$，故
  $$
  dp[i]=\min\Big(x\cdot s_i,\ \min_{j<i}\bigl(dp[j]+f_j\cdot s_i\bigr)\Big).
  $$
  每个已算出的 $j$ 对应一条直线 $y=f_j\cdot t+dp[j]$，一次转移就是对 $t=s_i$ 求所有直线的最小值。

- **做法**：`s`、`f` 无单调性，不能用双端队列凸包——它要求直线按斜率有序、或查询点单调才能均摊 $O(1)$；改用 Li Chao 树维护直线族：`add` 把斜率 `f[i]`、截距 `dp[i]` 的直线插入值域 $[0,10^6]$ 的线段树，`qry(s[i])` 取所有直线在 $s_i$ 处的最小值。插入与查询都以「直线的取值比较」为准，与直线顺序无关，故无需任何单调性。

- **正确性**：`qry` 返回所有已插入直线在 $s_i$ 处的最小值，即转移式右端的第二项；初始插入的直线 `(x, 0)` 对应 $x\cdot s_i$ 一项。每关先 `qry` 出 `dp` 再插入直线 `(f[i], dp)`（先查后插，避免同一关自己转移自己），最后一关必杀，故答案为最后一关算出的 `dp`。时间复杂度为 $O(n\log M)$，其中 $M = 10^6$ 为值域，空间复杂度为 $O(M)$。

:::details[题解(C++)]

```c++
const ll BIG = 4e18;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = BIG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * 1000005];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) > f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) > f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) > f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return min(res, qry(node << 1, l, mid, x));
    return min(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n;
    ll x;
    cin >> n >> x;
    vector<ll> s(n), fv(n);
    for (auto& v : s) cin >> v;
    for (auto& v : fv) cin >> v;
    for (int i = 0; i < 4 * 1000005; i++) tr[i] = Line();
    add(1, 0, 1000000, Line(x, 0));
    ll dp = 0;
    for (int i = 0; i < n; i++) {
        dp = qry(1, 0, 1000000, (int)s[i]);
        add(1, 0, 1000000, Line(fv[i], dp));
    }
    cout << dp << '\n';
}
```

:::

### Subarray Squares


**题目大意**：把长度为 `n` 的数组分成 `k` 个非空连续段（$n \le 3000$，$k \le n$），每段的代价为该段元素之和的平方，求最小总代价。

**解题思路**：

- **观察**：记前缀和 `pref`，则段 $[p+1..i]$ 的代价为 $(pref_i-pref_p)^2$，转移为
  $$
  dp[j][i]=\min_{p<i}\bigl(dp[j-1][p]+(pref_i-pref_p)^2\bigr).
  $$
  其中 $dp[j][i]$ 表示前 `i` 个元素分成 `j` 段的最小代价。该代价函数满足四边形不等式，最优分割点随 `i` 单调不减，故可用分治优化。

- **做法**：逐层计算 `dp[j][·]`，用滚动数组 `prev`/`cur` 省一维。每层调用 `solve_dc(l, r, optL, optR)`：先取中点 `mid`，只在区间 $[optL,\min(optR,mid-1)]$ 内枚举分割点求 `cur[mid]` 与其最优位置 `bestp`，再递归 `solve_dc(l, mid-1, optL, bestp)` 与 `solve_dc(mid+1, r, bestp, optR)`。

- **正确性**：四边形不等式保证最优分割点单调，左右区间的枚举下界、上界都能用 `bestp` 收紧，每层枚举总量的级别为 $O(n\log n)$。总时间复杂度为 $O(nk\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n), pref(n + 1, 0);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        pref[i + 1] = pref[i] + a[i];
    }

    const ll BIG = 4e18;
    vector<ll> prev(n + 1, BIG), cur(n + 1);
    prev[0] = 0;
    auto cost = [&](int p, int i) {
        ll s = pref[i] - pref[p];
        return s * s;
    };
    for (int j = 1; j <= k; j++) {
        cur.assign(n + 1, BIG);
        function<void(int, int, int, int)> solve_dc = [&](int l, int r,
                                                          int optL, int optR) {
            if (l > r)
                return;
            int mid = (l + r) >> 1;
            ll best = BIG;
            int bestp = -1;
            for (int p = optL; p <= min(optR, mid - 1); p++) {
                if (prev[p] >= BIG)
                    continue;
                ll v = prev[p] + cost(p, mid);
                if (v < best) {
                    best = v;
                    bestp = p;
                }
            }
            cur[mid] = best;
            if (bestp >= 0) {                  // // 无可行转移时不能拿 -1 去收缩区间（否则下层会读 prev[-1]）
                solve_dc(l, mid - 1, optL, bestp);
                solve_dc(mid + 1, r, bestp, optR);
            } else {
                solve_dc(l, mid - 1, optL, optR);
                solve_dc(mid + 1, r, optL, optR);
            }
        };
        solve_dc(1, n, 0, n - 1);
        swap(prev, cur);
    }
    cout << prev[n] << '\n';
}
```

:::

### Houses and Schools


**题目大意**：一维街道上有 `n` 个房子（$n \le 3000$），第 `i` 个房子在位置 `i`、有 $c_i$ 个孩子（$c_i \le 10^9$）。选择 `k` 个位置建学校，每个孩子去最近的学校，求所有孩子步行距离之和的最小值。

**解题思路**：

- **观察**：记 $cost[l][r]$ 为只在 $[l,r]$ 内建一所学校的最小总距离。设目标位置为 $m$，总代价为 $\sum_i c_i|i-m|$：$m$ 右移一格时，左侧房子的距离各增 1、右侧各减 1，斜率随位置由负变正，最小值在「第一个使左侧权重 $\ge$ 总权重一半的位置」取得，即权重中位数。`r` 增大时这个位置只向右移动，可用双指针维护：维护中位数两侧的权重和 `wl`/`wr` 与「位置 × 权重」和 `swl`/`swr`，代价为 `m * wl - swl + swr - m * wr`。

- **做法**：对每个 `l` 用双指针扫 `r`，求出全部 $cost[l][r]$；随后 DP：$dp[j][i]$ 表示前 `i` 个房子建 `j` 所学校的最小距离，转移为
  $$
  dp[j][i]=\min_{p<i}\bigl(dp[j-1][p]+cost[p+1][i]\bigr),
  $$
  该转移的代价项满足四边形不等式，最优分割点随 `i` 单调不减，同样可用分治优化：`solve_dc` 递归时用 `bestp` 收紧左右区间的枚举范围，滚动数组 `prev`/`cur` 省一维。

- **正确性**：中位数两侧的权重和与位置权重和给出的是真实步行距离之和（左侧房子到 `m` 的距离为 `m - i`、右侧为 `i - m`，与代码一致）；分治优化的正确性由最优分割点单调保证。总时间复杂度为 $O(n^2+nk\log n)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    vector<ll> W(n + 1, 0), SW(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        W[i] = W[i - 1] + c[i];
        SW[i] = SW[i - 1] + c[i] * i;
    }

    vector<vector<ll>> cost(n + 2, vector<ll>(n + 2, 0));
    for (int l = 1; l <= n; l++) {
        ll w = 0;
        int m = l;
        for (int r = l; r <= n; r++) {
            w += c[r];
            while (m < r && 2 * (W[m] - W[l - 1]) < w) m++;

            ll wl = W[m - 1] - W[l - 1], swl = SW[m - 1] - SW[l - 1];
            ll wr = W[r] - W[m], swr = SW[r] - SW[m];
            cost[l][r] = m * wl - swl + swr - m * wr;
        }
    }

    const ll BIG = 4e18;
    vector<ll> prev(n + 1, BIG), cur(n + 1);
    prev[0] = 0;
    for (int j = 1; j <= k; j++) {
        cur.assign(n + 1, BIG);
        function<void(int, int, int, int)> solve_dc = [&](int l, int r,
                                                          int optL, int optR) {
            if (l > r)
                return;
            int mid = (l + r) >> 1;
            ll best = BIG;
            int bestp = -1;
            for (int p = optL; p <= min(optR, mid - 1); p++) {
                if (prev[p] >= BIG)
                    continue;
                ll v = prev[p] + cost[p + 1][mid];
                if (v < best) {
                    best = v;
                    bestp = p;
                }
            }
            cur[mid] = best;
            if (bestp >= 0) {                  // // 无可行转移时不能拿 -1 去收缩区间（否则下层会读 prev[-1]）
                solve_dc(l, mid - 1, optL, bestp);
                solve_dc(mid + 1, r, bestp, optR);
            } else {
                solve_dc(l, mid - 1, optL, optR);
                solve_dc(mid + 1, r, optL, optR);
            }
        };
        solve_dc(1, n, 0, n - 1);
        swap(prev, cur);
    }
    cout << prev[n] << '\n';
}
```

:::

### Knuth Division


**题目大意**：把长度为 `n` 的数组逐步切成单个元素（$n \le 5000$），每次切分把当前子数组切成两段、代价等于被切子数组的元素和，求最小总代价。

**解题思路**：区间 DP：
$$
dp[l][r]=\min_{l\le m<r}\bigl(dp[l][m]+dp[m+1][r]+(pref_r-pref_{l-1})\bigr),
$$
最后一次切分把 `[l,r]` 分成两段，除两段自身代价外还要加上整段的和。直接枚举是 $O(n^3)$，用 Knuth 优化——四边形不等式的一个推论：最优分割点满足 `opt[l][r-1] <= opt[l][r] <= opt[l+1][r]`，于是内层 `m` 只在该区间内枚举；`len = 2` 时两个上界都还是初值 0，代码用 `lo == 0` 时取 `l`、`hi == 0` 时取 `r - 1` 回退到合法范围。摊销后总枚举量降为 $O(n^2)$。总时间复杂度为 $O(n^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> x(n + 1), pref(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        cin >> x[i];
        pref[i] = pref[i - 1] + x[i];
    }

    const ll BIG = 4e18;
    vector<vector<ll>> dp(n + 2, vector<ll>(n + 2, 0));
    vector<vector<int>> opt(n + 2, vector<int>(n + 2, 0));
    for (int len = 2; len <= n; len++) {
        for (int l = 1; l + len - 1 <= n; l++) {
            int r = l + len - 1;
            ll s = pref[r] - pref[l - 1];
            int lo = opt[l][r - 1], hi = opt[l + 1][r];
            if (lo == 0)
                lo = l;
            if (hi == 0)
                hi = r - 1;
            ll best = BIG;
            int bp = lo;
            for (int m = lo; m <= hi; m++) {
                ll v = dp[l][m] + dp[m + 1][r] + s;
                if (v < best) {
                    best = v;
                    bp = m;
                }
            }
            dp[l][r] = best;
            opt[l][r] = bp;
        }
    }
    cout << dp[1][n] << '\n';
}
```

:::

### Apples and Bananas


**题目大意**：有 `n` 个苹果与 `m` 根香蕉（$n, m, k \le 2 \times 10^5$），每个水果的重量在 $1..k$ 之间。对每个 `w = 2..2k`，输出重量和恰为 `w` 的「一个苹果配一根香蕉」的组合数。

**解题思路**：用计数数组 `A[x]` 表示重量为 `x` 的苹果个数、`B[x]` 同理，则 $ans[w]=\sum_x A[x]\cdot B[w-x]$ 恰是「和为 `w`」的配对计数，也就是多项式 $A$ 与 $B$ 乘积的系数。用 FFT 求出全部系数（每对水果只会被计数一次，因为苹果与香蕉来自各自固定的数组），输出时对第 `w` 项四舍五入取整。FFT 长度取不小于 $2k+2$ 的最小 2 的幂。时间复杂度为 $O(k\log k)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
typedef complex<long double> cd;
void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j)
            swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long double ang = 2 * acosl(-1.0L) / len * (invert ? -1 : 1);
        cd wlen(cosl(ang), sinl(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert)
        for (cd& x : a) x /= n;
}
void solve() {
    int k, n, m;
    cin >> k >> n >> m;
    int sz = 1;
    while (sz < 2 * k + 2) sz <<= 1;
    vector<cd> A(sz, 0), B(sz, 0);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        A[x] += 1;
    }
    for (int i = 0; i < m; i++) {
        int x;
        cin >> x;
        B[x] += 1;
    }
    fft(A, false);
    fft(B, false);
    for (int i = 0; i < sz; i++) A[i] *= B[i];
    fft(A, true);
    for (int w = 2; w <= 2 * k; w++) {
        cout << (ll)llroundl(A[w].real()) << ' ';
    }
    cout << '\n';
}
```

:::

### One Bit Positions


**题目大意**：给定长度为 `n` 的 01 串（$n \le 2 \times 10^5$），对每个距离 `d = 1..n-1`，统计位置差恰为 `d` 且两位都是 1 的数对个数。

**解题思路**：令 `A[i] = 1` 当 `s[i] == '1'`，把 `A` 反转得到 `B[i] = A[n-1-i]`。卷积第 `t` 项
$$
C[t]=\sum_i A[i]\cdot B[t-i]=\#\{(i,p):p-i=n-1-t,\ \text{两位置都是 }1\},
$$
故距离 `d` 的答案即 `C[n - 1 - d]`。用 FFT 一次求出全部卷积系数，逐个 `d` 输出四舍五入后的值。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef complex<long double> cd;
void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j)
            swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long double ang = 2 * acosl(-1.0L) / len * (invert ? -1 : 1);
        cd wlen(cosl(ang), sinl(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert)
        for (cd& x : a) x /= n;
}
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    int sz = 1;
    while (sz < 2 * n) sz <<= 1;
    vector<cd> A(sz, 0), B(sz, 0);
    for (int i = 0; i < n; i++)
        if (s[i] == '1') {
            A[i] = 1;
            B[n - 1 - i] = 1;
        }
    fft(A, false);
    fft(B, false);
    for (int i = 0; i < sz; i++) A[i] *= B[i];
    fft(A, true);

    for (int d = 1; d <= n - 1; d++) {
        ll c = (ll)llroundl(A[n - 1 - d].real());
        cout << c << ' ';
    }
    cout << '\n';
}
```

:::

### Signal Processing


**题目大意**：给定长度 `n` 的信号数组 `a` 与长度 `m` 的掩码数组 `b`（$n, m \le 2 \times 10^5$），输出它们的交叉相关：对每个 `k = -(m-1)..n-1`，输出 $\sum_i a_{i+k}\cdot b_i$（越界下标忽略）。

**解题思路**：把 `b` 反转放入 `B[m-1-i]`，卷积第 `t` 项为
$$
C[t]=\sum_i A[i]\cdot B[t-i]=\sum_i a_i\cdot b_{i-t+m-1}.
$$
令 `t = k + m - 1` 得 $C[k+m-1]=\sum_i a_{i+k}\cdot b_i$（越界下标处 $A$、$B$ 为 0，自动忽略），正是 `k` 位置的交叉相关。用 FFT 一次求出全部系数，按 `k` 从 $-(m-1)$ 到 `n-1` 的顺序输出 `A[k + m - 1]` 的四舍五入值。时间复杂度为 $O((n+m)\log(n+m))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
typedef complex<long double> cd;
void fft(vector<cd>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j)
            swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        long double ang = 2 * acosl(-1.0L) / len * (invert ? -1 : 1);
        cd wlen(cosl(ang), sinl(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int j = 0; j < len / 2; j++) {
                cd u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert)
        for (cd& x : a) x /= n;
}
void solve() {
    int n, m;
    cin >> n >> m;
    vector<int> a(n), b(m);
    for (auto& v : a) cin >> v;
    for (auto& v : b) cin >> v;
    int sz = 1;
    while (sz < n + m) sz <<= 1;
    vector<cd> A(sz, 0), B(sz, 0);
    for (int i = 0; i < n; i++) A[i] = a[i];
    for (int i = 0; i < m; i++) B[m - 1 - i] = b[i];
    fft(A, false);
    fft(B, false);
    for (int i = 0; i < sz; i++) A[i] *= B[i];
    fft(A, true);

    for (int k = -(m - 1); k <= n - 1; k++) {
        ll v = (ll)llroundl(A[k + m - 1].real());
        cout << v << ' ';
    }
    cout << '\n';
}
```

:::

### New Roads Queries


**题目大意**：`n` 个城市、`m` 条道路按输入顺序在 1..m 天依次建成（$n, m, q \le 2 \times 10^5$）。`q` 次询问：城市 `a` 与 `b` 最早在第几天连通；若始终不连通输出 -1（`a = b` 视为第 0 天连通）。

**解题思路**：

- **观察**：把「前若干天的边」看成随时间递增的集合，则询问「最早第几天连通」等价于对天数二分：答案区间的中点 `mid` 之前（含）的边全部加入后若已连通，答案在左半，否则在右半。加入边是并查集的合并，只能增不能删，而二分需要回退到历史状态，故用可撤销并查集：按大小合并（不写路径压缩），每次修改把「被改的变量指针与原值」压入历史栈 `hist`，`rollback(snap)` 弹栈恢复。

- **做法**：`solve_dc(L, R, qs)` 处理答案区间 $[L,R]$ 上的询问集合：取中点 `mid`，快照 `s = snap()` 后加入第 `L..mid` 条边，按当前连通性把 `qs` 分成「已连通」（答案在左半）与「未连通」（在右半）两组，再 `rollback(s)` 撤销这些边；先递归 `solve_dc(L, mid, left)`，再重新加入 `L..mid` 条边后递归 `solve_dc(mid + 1, R, right)`，最后再次回滚。`L == R` 时单独加入第 `L` 条边，逐个体检：连通则答案为 `L`，否则 -1。

- **正确性**：递归进入右半时左半的边必须仍在并查集中，故在两次递归之间重新加入并回滚；快照—回滚保证并查集状态与递归层次严格对应。查询集合在每次分组后规模减半，共 $O(\log m)$ 层。总时间复杂度为 $O((m+q)\log m\cdot\alpha)$，空间复杂度为 $O(n+m+q)$。

:::details[题解(C++)]

```c++
int n, m, q;
vector<pair<int, int>> edges;
vector<int> anss;
vector<int> fa, szv;
vector<pair<int*, int>> hist;
int find(int x) {
    while (fa[x] != x) x = fa[x];
    return x;
}
void unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b)
        return;
    if (szv[a] < szv[b])
        swap(a, b);
    hist.push_back({&fa[b], fa[b]});
    hist.push_back({&szv[a], szv[a]});
    fa[b] = a;
    szv[a] += szv[b];
}
int snap() { return hist.size(); }
void rollback(int s) {
    while (hist.size() > s) {
        auto [p, v] = hist.back();
        hist.pop_back();
        *p = v;
    }
}
struct Query {
    int a, b, id;
};
void solve_dc(int L, int R, vector<Query>& qs) {
    if (qs.empty())
        return;
    if (L == R) {
        int s = snap();
        unite(edges[L].first, edges[L].second);
        for (auto& qu : qs) anss[qu.id] = find(qu.a) == find(qu.b) ? L : -1;
        rollback(s);
        return;
    }
    int mid = (L + R) >> 1;
    int s = snap();
    for (int i = L; i <= mid; i++) unite(edges[i].first, edges[i].second);
    vector<Query> left, right;
    for (auto& qu : qs) {
        if (find(qu.a) == find(qu.b))
            left.push_back(qu);
        else
            right.push_back(qu);
    }
    rollback(s);
    solve_dc(L, mid, left);
    for (int i = L; i <= mid; i++) unite(edges[i].first, edges[i].second);
    solve_dc(mid + 1, R, right);
    rollback(s);
}
void solve() {
    cin >> n >> m >> q;
    edges.resize(m + 1);
    for (int i = 1; i <= m; i++) {
        cin >> edges[i].first >> edges[i].second;
        edges[i].first--;
        edges[i].second--;
    }
    fa.resize(n);
    szv.assign(n, 1);
    iota(fa.begin(), fa.end(), 0);
    anss.assign(q, 0);
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i].a >> qs[i].b;
        qs[i].a--, qs[i].b--;
        qs[i].id = i;
        if (qs[i].a == qs[i].b)
            anss[i] = 0;
    }
    vector<Query> qs2;
    for (auto& qu : qs)
        if (qu.a != qu.b)
            qs2.push_back(qu);
    solve_dc(1, m, qs2);
    for (int v : anss) cout << v << '\n';
}
```

:::

### Dynamic Connectivity


**题目大意**：给定无向图（$n \le 10^5$），初始有 `m` 条边（$m \le 10^5$），随后有 `k` 个操作（$k \le 10^5$）：加一条边或删一条边。输出初始状态以及每次操作后的连通分量数。

**解题思路**：

- **观察**：用 `map` 记录每条边的出现时间：遇到删除操作时，把该边的存活区间「加入时间 .. 删除前一刻」登记；全部操作结束后仍未删除的边存活到第 `k` 天（初始边的加入时间为 0）。把每个存活区间插入时间线段树，则问题化为：在天数轴上做 DFS，进入节点时并入该节点记录的全部边，回溯时撤销。

- **做法**：线段树分治。可撤销并查集只按大小合并（不写路径压缩），把 `fa`、`szv` 与连通分量数 `comps` 的每次修改压入历史栈 `hist`；`dfs(node, l, r)` 先快照，再并入 `seg[node]` 中的边，若到达叶子 `l == r` 就把当前 `comps` 记入 `ansArr[l]`，否则递归左右孩子，最后回滚到快照。

- **正确性**：一条边在其存活区间的每个时刻都被并入，故叶子的 `comps` 恰为该时刻的连通分量数；撤销操作使每次回溯都能精确恢复到进入前的状态。总时间复杂度为 $O((m+k)\log k\cdot\alpha)$，空间复杂度为 $O(n+m+k)$。

:::details[题解(C++)]

```c++
vector<int> fa, szv;
vector<pair<int*, int>> hist;
int comps;
int find(int x) {
    while (fa[x] != x) x = fa[x];
    return x;
}
void unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b)
        return;
    if (szv[a] < szv[b])
        swap(a, b);
    hist.push_back({&fa[b], fa[b]});
    hist.push_back({&szv[a], szv[a]});
    hist.push_back({&comps, comps});
    fa[b] = a;
    szv[a] += szv[b];
    comps--;
}
int snap() { return hist.size(); }
void rollback(int s) {
    while (hist.size() > s) {
        auto p = hist.back();
        hist.pop_back();
        *p.first = p.second;
    }
}
vector<vector<pair<int, int>>> seg;
void addSeg(int node, int l, int r, int ql, int qr, pair<int, int> e) {
    if (qr < l || r < ql)
        return;
    if (ql <= l && r <= qr) {
        seg[node].push_back(e);
        return;
    }
    int mid = (l + r) >> 1;
    addSeg(node << 1, l, mid, ql, qr, e);
    addSeg(node << 1 | 1, mid + 1, r, ql, qr, e);
}
vector<int> ansArr;
void dfs(int node, int l, int r) {
    int s = snap();
    for (auto& e : seg[node]) unite(e.first, e.second);
    if (l == r)
        ansArr[l] = comps;
    else {
        int mid = (l + r) >> 1;
        dfs(node << 1, l, mid);
        dfs(node << 1 | 1, mid + 1, r);
    }
    rollback(s);
}
void solve() {
    int n, m, k;
    cin >> n >> m >> k;
    fa.resize(n);
    szv.assign(n, 1);
    iota(fa.begin(), fa.end(), 0);
    comps = n;
    seg.assign(4 * (k + 1), {});
    map<pair<int, int>, int> addTime;
    auto idOf = [&](int a, int b) {
        if (a > b)
            swap(a, b);
        return pair<int, int>{a, b};
    };
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        addTime[idOf(a, b)] = 0;
    }
    for (int i = 1; i <= k; i++) {
        int t, a, b;
        cin >> t >> a >> b;
        a--, b--;
        auto id = idOf(a, b);
        if (t == 1)
            addTime[id] = i;
        else {
            addSeg(1, 0, k, addTime[id], i - 1, id);
            addTime.erase(id);
        }
    }
    for (auto& pr : addTime) addSeg(1, 0, k, pr.second, k, pr.first);
    ansArr.assign(k + 1, 0);
    dfs(1, 0, k);
    for (int i = 0; i <= k; i++) cout << ansArr[i] << ' ';
    cout << '\n';
}
```

:::

### Parcel Delivery


**题目大意**：从城市 1 向城市 `n` 送 `k` 件包裹（$n \le 500$，$k \le 50$）。每条边有容量 `c` 与单件成本 `d`（多条边共享容量，流在边上可拆分），求运完 `k` 件包裹的最小总成本；不可能运完输出 -1。

**解题思路**：建模为最小费用最大流：源点 1、汇点 `n`，每条边容量 `c`、单位费用 `d`，并加入容量 0、费用 `-d` 的反向边用于退流。反复用 SPFA 在残量网络（只走 `e.cap > 0` 的边）上求 1 到 `n` 的费用最短路，把瓶颈容量压入增广；若某轮汇点不可达则说明流量不足 `k`，输出 -1。每轮沿最短路增广得到的是当前剩余流量的最小费用增广方案，且每次至少压入 1 单位，故不超过 `k` 轮。总时间复杂度为 $O(k\cdot n\cdot m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
struct Edge {
    int to, cap;
    ll cost;
    int rev;
};
vector<vector<Edge>> g;
void addEdge(int u, int v, int cap, ll cost) {
    g[u].push_back({v, cap, cost, (int)g[v].size()});
    g[v].push_back({u, 0, -cost, (int)g[u].size() - 1});
}
void solve() {
    int n, m, k;
    cin >> n >> m >> k;
    g.assign(n, {});
    for (int i = 0; i < m; i++) {
        int a, b;
        ll c, d;
        cin >> a >> b >> c >> d;
        a--, b--;
        addEdge(a, b, (int)c, d);
    }

    const ll BIG = 4e18;
    ll total = 0, flow = 0;
    while (flow < k) {
        vector<ll> dist(n, BIG);
        vector<int> pv(n, -1), pe(n, -1);
        vector<bool> inq(n, false);
        dist[0] = 0;
        queue<int> q;
        q.push(0);
        inq[0] = true;
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            inq[v] = false;
            for (int i = 0; i < (int)g[v].size(); i++) {
                Edge& e = g[v][i];
                if (e.cap > 0 && dist[e.to] > dist[v] + e.cost) {
                    dist[e.to] = dist[v] + e.cost;
                    pv[e.to] = v;
                    pe[e.to] = i;
                    if (!inq[e.to]) {
                        inq[e.to] = true;
                        q.push(e.to);
                    }
                }
            }
        }
        if (dist[n - 1] >= BIG) {
            cout << -1 << '\n';
            return;
        }
        int f = k - flow;
        for (int v = n - 1; v != 0; v = pv[v]) f = min(f, g[pv[v]][pe[v]].cap);
        for (int v = n - 1; v != 0; v = pv[v]) {
            Edge& e = g[pv[v]][pe[v]];
            e.cap -= f;
            g[v][e.rev].cap += f;
        }
        total += (ll)f * dist[n - 1];
        flow += f;
    }
    cout << total << '\n';
}
```

:::

### Task Assignment


**题目大意**：`n` 个员工、`n` 个任务（$n \le 200$），第 `i` 个员工做第 `j` 个任务的成本为 $c_{i,j}$。求总成本最小的分配方案：输出最小总成本，随后 `n` 行每行输出「员工编号 任务编号」。

**解题思路**：匈牙利算法求最小权完美匹配（对偶变量形式）。`u[i]`、`v[j]` 为行、列势，`minv[j]` 为当前增广中各列的最小松弛值，`way[j]` 记录松弛来源。对每个员工做一轮增广：从未匹配列出发（`p[0] = i`），在未用列中找松弛值最小的列 `j1` 作为 `delta`，按 `used` 与否分别更新 `u`、`v`、`minv` 后前进到 `j1`，直到抵达未匹配列；再沿 `way` 链翻转匹配。全部增广后 `p[j]` 为列 `j` 匹配到的员工，员工 `i` 的任务由 `assign[p[j] - 1] = j` 得到。

- **正确性**：势满足 $u_i+v_j\le c_{i,j}$，缩减成本 $c_{i,j}-u_i-v_j$ 非负，每轮增广只沿其值为 0 的边进行，故每轮把匹配规模加 1 且总成本增加量恰为 `delta`。时间复杂度为 $O(n^3)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<vector<ll>> c(n, vector<ll>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> c[i][j];

    const ll BIG = 4e18;
    vector<ll> u(n + 1), v(n + 1), p(n + 1), way(n + 1);
    for (int i = 1; i <= n; i++) {
        p[0] = i;
        ll j0 = 0;
        vector<ll> minv(n + 1, BIG);
        vector<bool> used(n + 1, false);
        do {
            used[j0] = true;
            ll i0 = p[j0], delta = BIG, j1 = 0;
            for (int j = 1; j <= n; j++) {
                if (!used[j]) {
                    ll cur = c[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) {
                        minv[j] = cur;
                        way[j] = j0;
                    }
                    if (minv[j] < delta) {
                        delta = minv[j];
                        j1 = j;
                    }
                }
            }
            for (int j = 0; j <= n; j++) {
                if (used[j]) {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else
                    minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] != 0);
        do {
            ll j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0);
    }
    vector<int> assign(n);
    for (int j = 1; j <= n; j++) assign[p[j] - 1] = j;
    ll ans = 0;
    for (int i = 0; i < n; i++) ans += c[i][assign[i] - 1];
    cout << ans << '\n';
    for (int i = 0; i < n; i++) cout << i + 1 << ' ' << assign[i] << '\n';
}
```

:::

### Distinct Routes II


**题目大意**：给定有向图，需要安排 `k` 天、每天一条从 1 到 `n` 的路径（$k \le 500$，$n \le 500$），每条边在所有路径中最多使用一次。求 `k` 天路径总边数的最小值，并输出每天的路径；无法凑出 `k` 条路径输出 -1。

**解题思路**：

- **观察**：把「每天一条路径、边不重复使用」建模为最小费用流：每条边容量 1、费用 1，从 1 到 `n` 发送 `k` 单位流量，总费用即总边数；`k` 条边不相交路径按流量分解与整数流一一对应，每条路径的边数就是它贡献的费用。

- **做法**：用 SPFA 逐轮增广，每轮沿最短路压入 1 单位流量并累加费用；某轮汇点不可达说明流不满 `k`，输出 -1 并结束。全部增广后，`fwd` 中每条容量被用尽（`cap == 0`）的边就是路径用过的边，把它们组成邻接表 `adj`；从 1 出发做 `k` 次 DFS 找一条到 `n` 的路径，找到后立即把路径上的边从 `adj` 中删除，保证边不重复使用，路径失配则提前结束。

- **正确性**：每条边容量为 1，故路径之间边不相交；整数流的流量守恒保证每条从 1 到 `n` 的单位流可分解为一条路径。总时间复杂度为 $O(k\cdot n\cdot m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
struct Edge {
    int to, cap;
    ll cost;
    int rev;
};
vector<vector<Edge>> g;
vector<array<int, 3>> fwd;
void addEdge(int u, int v, int cap, ll cost) {
    fwd.push_back({u, v, (int)g[u].size()});
    g[u].push_back({v, cap, cost, (int)g[v].size()});
    g[v].push_back({u, 0, -cost, (int)g[u].size() - 1});
}
void solve() {
    int n, m, k;
    cin >> n >> m >> k;
    g.assign(n, {});
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        addEdge(a, b, 1, 1);
    }

    const ll BIG = 4e18;
    ll total = 0;
    for (int it = 0; it < k; it++) {
        vector<ll> dist(n, BIG);
        vector<int> pv(n, -1), pe(n, -1);
        vector<bool> inq(n, false);
        dist[0] = 0;
        queue<int> q;
        q.push(0);
        inq[0] = true;
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            inq[v] = false;
            for (int i = 0; i < (int)g[v].size(); i++) {
                Edge& e = g[v][i];
                if (e.cap > 0 && dist[e.to] > dist[v] + e.cost) {
                    dist[e.to] = dist[v] + e.cost;
                    pv[e.to] = v;
                    pe[e.to] = i;
                    if (!inq[e.to]) {
                        inq[e.to] = true;
                        q.push(e.to);
                    }
                }
            }
        }
        if (dist[n - 1] >= BIG) {
            cout << -1 << '\n';
            return;
        }
        for (int v = n - 1; v != 0; v = pv[v]) {
            Edge& e = g[pv[v]][pe[v]];
            e.cap -= 1;
            g[v][e.rev].cap += 1;
        }
        total += dist[n - 1];
    }

    vector<vector<int>> adj(n);
    for (auto& e3 : fwd) {
        int u = e3[0], v = e3[1], idx = e3[2];
        if (g[u][idx].cap == 0)
            adj[u].push_back(v);
    }
    cout << total << '\n';
    for (int it = 0; it < k; it++) {
        vector<int> p;
        vector<int> vis(n, 0);

        function<bool(int)> findPath = [&](int u) -> bool {
            vis[u] = 1;
            p.push_back(u);
            if (u == n - 1)
                return true;
            for (int i = 0; i < (int)adj[u].size(); i++) {
                int v = adj[u][i];
                if (vis[v])
                    continue;
                if (findPath(v))
                    return true;
            }
            p.pop_back();
            return false;
        };
        vis.assign(n, 0);
        p.clear();
        if (!findPath(0))
            break;
        for (int i = 0; i + 1 < (int)p.size(); i++) {
            int u = p[i], v = p[i + 1];
            auto& vec = adj[u];
            vec.erase(remove(vec.begin(), vec.end(), v), vec.end());
        }
        cout << p.size();
        for (int x : p) cout << ' ' << x + 1;
        cout << '\n';
    }
}
```

:::

## Interactive Problems

### Hidden Integer


**题目大意**：交互程序藏有一个整数 $x$（$1 \le x \le 10^9$）。每次输出 `? y` 可以询问命题 `y < x` 是否成立（$1 \le y \le 10^9$），并读入 `YES` 或 `NO`；最多询问 30 次，确定答案后输出 `! x`。例如隐藏数为 7 时，`? 3` 与 `? 6` 都返回 `YES`，`? 7` 返回 `NO`，随后输出 `! 7`。

**解题思路**：二分答案。用闭区间 `[l, r]` 维护 `x` 的可能取值范围，初始为 `[1, 10^9]`；当 `l < r` 时取中点 `mid = (l + r) / 2` 并询问 `mid < x`：返回 `YES` 说明 $x > mid$，令 `l = mid + 1`；返回 `NO` 说明 $x \le mid$，令 `r = mid`。两种更新都不会把真实取值排除出区间，且每轮结束后区间长度不超过原来的一半；$10^9 < 2^{30}$，故 30 次询问内必然出现 `l == r`，此时区间内唯一的整数 `l` 就是 `x`，输出 `! l`。每次询问用 `endl` 立即刷新输出。总询问次数为 $O(\log 10^9)$。

:::details[题解(C++)]

```c++
int check(int x) {
    cout << "? " << x << endl;
    string s;
    cin >> s;
    return s == "YES" ? 1 : 0;
}
void solve() {
    int l = 1, r = 1e9;
    while (l < r) {
        int mid = (l + r) / 2;
        if (check(mid)) {
            l = mid + 1;
        } else {
            r = mid;
        }
    }
    cout << "! " << l << endl;
}
```

:::

### Hidden Permutation


**题目大意**：交互程序藏有 $1, 2, \dots, n$ 的一个排列 `a`（$n \le 1000$）。先读入 `n`；每次输出 `? i j` 可以询问 `a[i] < a[j]` 是否成立，并读入 `YES` 或 `NO`，询问次数不超过 $10^4$。还原整个排列后输出 `!` 与所有 `a[i]`。例如 $n = 3$、排列为 $(3, 1, 2)$ 时，`? 3 2` 返回 `NO`、`? 3 1` 返回 `YES`，随后输出 `! 3 1 2`。

**解题思路**：询问只能比较两个位置上的值，故按隐藏值对位置排序。数组 `order` 存放位置，并始终保持 $a[order[0]] < a[order[1]] < \cdots$：初始只放入位置 1，依次处理位置 `i = 2..n` 时在 `order` 的下标区间 $[lo, hi)$ 上二分插入位置（`lo` 初值 0、`hi` 初值 `order.size()`），比较 `ask(i, order[mid])`，即询问 $a[i] < a[order[mid]]$：返回 `YES` 则 `hi = mid`，否则 `lo = mid + 1`；循环结束时 `lo` 就是插入位置，执行 `order.insert(order.begin() + lo, i)`。排序完成后 `order` 已按隐藏值升序，而隐藏值是 $1..n$ 的排列，故 `order[i]` 的隐藏值恰为 $i + 1$，据此令 `a[order[i] - 1] = i + 1` 并输出。插入位置 `i` 需要 $O(\log i)$ 次询问；每次询问用 `endl` 立即刷新输出。总询问次数为 $O(n \log n)$（$n \le 1000$ 时不超过 $10^4$），含 `vector` 插入的元素移动，总时间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
bool ask(int i, int j)
{
    cout << "? " << i << ' ' << j << endl;
    string r;
    cin >> r;
    return r == "YES";
}
void solve()
{
    int n;
    cin >> n;
    vector<int> order;
    order.push_back(1);
    for (int i = 2; i <= n; i++)
    {
        int lo = 0, hi = order.size();
        while (lo < hi)
        {
            int mid = (lo + hi) / 2;
            if (ask(i, order[mid]))
                hi = mid;
            else
                lo = mid + 1;
        }
        order.insert(order.begin() + lo, i);
    }
    vector<int> a(n);
    for (int i = 0; i < n; i++) a[order[i] - 1] = i + 1;
    cout << "! ";
    for (int x : a) cout << x << ' ';
    cout << endl;
}
```

:::

### K-th Highest Score


**题目大意**：芬兰和瑞典各有 `n` 个分数，全部 $2n$ 个分数互不相同（$n \le 10^5$，$1 \le k \le 2n$，每个分数为 $1$ 到 $10^9$ 之间的整数）。先读入 `n` 与 `k`；每次输出 `F i` 或 `S i`（$1 \le i \le n$）可以查询芬兰或瑞典第 `i` 高的分数，两类查询合计不超过 100 次。要求求出两国共 $2n$ 个分数中的第 `k` 大，并输出 `!` 与答案。例如 `n = 3`、`k = 1`、芬兰分数为 $(9, 4, 3)$、瑞典分数为 $(8, 6, 1)$ 时，`F 1` 返回 9、`S 1` 返回 8，随后输出 `! 9`。

**解题思路**：

- **观察**：记芬兰第 `x` 高的分数为 $F[x]$、瑞典第 `y` 高的分数为 $S[y]$，越界下标约定为 $+\infty$。对每个合法分配 $x \in [\max(0,\ k - n),\ \min(n,\ k)]$，$g(x) = \min(F[x],\ S[k-x])$ 是第 `k` 大的下界：$F[1..x]$ 中的数都不小于 $F[x]$、$S[1..k-x]$ 中的数都不小于 $S[k-x]$，这 `x` 个加 `k - x` 个共 `k` 个数都不小于 $g(x)$，故第 `k` 大不小于 $g(x)$。另一方面，设第 `k` 大及其之前的 `k` 个数中属于芬兰的有 $x^*$ 个，则这 `k` 个数恰是 $F[1..x^*]$ 与 $S[1..k-x^*]$ 的并，其中最小的数即 $g(x^*) = \min(F[x^*],\ S[k-x^*])$，也就是第 `k` 大。因此答案为 $\max_x g(x)$。

- **做法**：$F[x]$ 随 `x` 单调不增、$S[k-x]$ 随 `x` 单调不减，故 $g(x)$ 先不减后不增，是单峰函数。在 $[L, R]$（`L = max(0, k - n)`、`R = min(n, k)`）上二分峰值：取 `mid = (L + R) / 2`，比较 `g(mid)` 与 `g(mid + 1)`（`mid < R` 保证 `mid + 1` 合法）：前者更小则峰值在右半，令 `L = mid + 1`，否则令 `R = mid`；循环结束时 `L == R`，输出 `! g(L)`。函数 `g` 由 `askF`、`askS` 实现，一侧下标越界时取大常量 `BIG`，使 `min` 自动退化为另一侧的值。每次询问用 `endl` 立即刷新输出。二分共 $O(\log n)$ 轮、每轮至多 4 次询问，总询问次数为 $O(\log n)$（$n \le 10^5$ 时不超过 68 次），满足 100 次限制。

:::details[题解(C++)]

```c++
int n, k;
ll askF(int i) {
    cout << "F " << i << endl;
    ll v;
    cin >> v;
    return v;
}
ll askS(int i) {
    cout << "S " << i << endl;
    ll v;
    cin >> v;
    return v;
}
void solve() {
    cin >> n >> k;
    const ll BIG = 4e18;
    auto g = [&](int x) -> ll {
        ll a = (x >= 1 && x <= n) ? askF(x) : BIG;
        ll b = (k - x >= 1 && k - x <= n) ? askS(k - x) : BIG;
        return min(a, b);
    };
    int L = max(0, k - n), R = min(n, k);
    while (L < R) {
        int mid = (L + R) / 2;
        if (g(mid) < g(mid + 1))
            L = mid + 1;
        else
            R = mid;
    }
    cout << "! " << g(L) << endl;
}
```

:::

### Permuted Binary Strings


**题目大意**：交互程序藏有 $1, 2, \dots, n$ 的一个排列 $a_1, a_2, \dots, a_n$（$n \le 1000$）。先读入 `n`；每次输出一个 01 串 $b_1 b_2 \cdots b_n$，会收到串 $c_1 c_2 \cdots c_n = b_{a_1} b_{a_2} \cdots b_{a_n}$，即返回串第 `j` 个字符满足 $c_j = b_{a_j}$，询问次数不超过 10。查清排列后输出 `!` 与 $a_1\ a_2\ \cdots\ a_n$。例如排列为 $(1, 3, 2)$ 时，输出 `? 100` 收到 `100`（$b_{a_1} b_{a_2} b_{a_3} = b_1 b_3 b_2$），输出 `? 010` 收到 `001`，随后输出 `! 1 3 2`。

**解题思路**：

- **观察**：返回串第 `j` 个字符始终取自询问串的第 $a_j$ 个字符，与询问串其余位置的内容无关。因此只要在询问串的每个位置写入该位置的编号，返回串对应位置上读出的就是 $a_j$。

- **做法**：以编号 $1..n$ 的二进制表示为编码。取最小整数 `bits` 使 $2^{bits} \ge n + 1$，保证编号 $1..n$ 都能用 `bits` 位互不相同地表示。第 `t` 次询问（`t = 0, 1, \dots, bits - 1`）构造串 `b`：编号 `i` 的第 `t` 位为 1 时置 `b[i - 1] = '1'`，否则保持 `'0'`。返回串 `c` 的第 `j` 个字符就是 $a_{j+1}$ 的第 `t` 位（字符串下标 `j` 从 0 开始，对应排列下标 `j + 1`），存入 `res[t][j]`。全部询问结束后对每个 `j` 重建 `v`：`res[t][j] == '1'` 时执行 `v |= 1 << t`，得到的 `v` 即 $a_{j+1}$，依次输出。

- **正确性**：$1..n$ 的 `bits` 位二进制编码互不相同，故按位重建的结果唯一，就是 $a_{j+1}$；每次询问同时传送全部 `n` 个位置各一位，`bits` 次询问覆盖所有位，排列随之完全确定。`bits` 恰为 $\lceil \log_2(n + 1) \rceil$，$n \le 1000$ 时不超过 10，满足 10 次询问的限制。每次询问用 `endl` 立即刷新输出。总询问次数为 $\lceil \log_2(n + 1) \rceil$，构造与解码的时间复杂度为 $O(n \cdot bits)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    int bits = 0;
    while ((1 << bits) < n + 1) bits++;
    vector<vector<char>> res(bits);
    for (int t = 0; t < bits; t++) {
        string b(n, '0');
        for (int i = 1; i <= n; i++)
            if ((i >> t) & 1)
                b[i - 1] = '1';
        cout << "? " << b << endl;
        string c;
        cin >> c;
        res[t] = vector<char>(c.begin(), c.end());
    }
    cout << "! ";
    for (int j = 0; j < n; j++) {
        int v = 0;
        for (int t = 0; t < bits; t++)
            if (res[t][j] == '1')
                v |= 1 << t;
        cout << v << ' ';
    }
    cout << endl;
}
```

:::

### Colored Chairs


**题目大意**：`n` 把椅子围成一圈并依次编号为 $1..n$，第 `i` 把与第 `i+1` 把相邻（第 $n+1$ 把即第 1 把），每把椅子的颜色为红色 `R` 或蓝色 `B`（$3 \le n \le 2 \times 10^5$，`n` 为奇数）。先读入 `n`；每次输出 `? i` 可以查询第 `i` 把椅子的颜色，查询次数不超过 20。要求找出一对相邻且同色的椅子，输出 `! i` 表示第 `i` 把与第 `i+1` 把同色（`i = n` 时后者为第 1 把）。例如 `n = 5` 时查询 `? 1`、`? 2`、`? 3` 依次得到 `R`、`B`、`B`，输出 `! 2` 即满足要求。

**解题思路**：

- **观察**：先查询第 1 把椅子的颜色 `c1`，并构造理想交替序列：第 `i` 把椅子的期望颜色 `exp` 在 `i` 为奇数时取 `c1`、在 `i` 为偶数时取另一色。把虚拟位置 $n+1$ 视作第 1 把椅子，其颜色即 `c1`，不需要额外查询。记失配指示 $f(i)$ 表示第 `i` 把椅子的实际颜色是否不等于 `exp`：相邻两把椅子同色当且仅当 $f$ 在这两处取值不同，因为 `exp` 在相邻位置必然异色，两把椅子实际同色等价于其中恰有一把与期望不符。$f(1) = 0$；`n` 为奇数使 $n+1$ 为偶数位，该处的期望颜色与 `c1` 相异而实际颜色为 `c1`，故 $f(n+1) = 1$，说明 $[1, n+1]$ 上必有相邻同色的椅子对。

- **做法**：在 $[2, n+1]$ 上二分 $f$ 的第一个为 1 的位置，维护不变量 $f(lo - 1) = 0$ 与 $f(hi) = 1$，初值 `lo = 2`、`hi = n + 1`（$f(1) = 0$、$f(n+1) = 1$ 已由观察得到，两端都不需要查询）。每轮取 `mid = (lo + hi) / 2`：用 `ask(mid)` 查询第 `mid` 把椅子的颜色 `cm`（`mid == n + 1` 时是哨兵位置，直接取 `c1`），并按 `(mid - 1) % 2 == 0` 决定 `exp` 取 `c1` 还是另一色；`cm != exp` 时 `hi = mid`，否则 `lo = mid + 1`。

- **正确性**：循环结束时 `lo == hi`，由不变量得 $f(lo - 1) \ne f(lo)$，故第 `lo-1` 把与第 `lo` 把椅子相邻且同色，输出 `! lo - 1` 即可；`lo = n + 1` 时哨兵代表第 1 把椅子，输出的 `n` 对应环上相邻的第 `n` 把与第 1 把。每次询问用 `endl` 立即刷新输出。总询问次数为 $1 + \lceil \log_2 n \rceil$（$n \le 2 \times 10^5$ 且为奇数时不超过 19 次），满足 20 次限制。

:::details[题解(C++)]

```c++
char ask(int i) {
    cout << "? " << i << endl;
    char c;
    cin >> c;
    return c;
}
void solve() {
    int n;
    cin >> n;
    char c1 = ask(1);
    int lo = 2, hi = n + 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        char cm = (mid <= n) ? ask(mid) : c1;
        char exp = ((mid - 1) % 2 == 0) ? c1 : (c1 == 'R' ? 'B' : 'R');
        if (cm != exp)
            hi = mid;
        else
            lo = mid + 1;
    }
    cout << "! " << lo - 1 << endl;
}
```

:::

### Inversion Sorting


**题目大意**：交互程序藏有 $1, 2, \dots, n$ 的一个排列（$n \le 1000$）。先读入 `n`；每次输出两个整数 $l\ r$，程序会先把区间 $[l, r]$ 翻转，再返回当前整个排列的逆序对数；返回值变为 0 时排列已经升序，交互随即结束。要求用不超过 $4n$ 次翻转把排列排成升序。例如 $n = 3$、初始排列为 $(3, 1, 2)$ 时，输出 `1 2` 后返回 1（排列变为 $(1, 3, 2)$），再输出 `2 3` 后返回 0，排序完成。

**解题思路**：

- **观察**：设区间长度为 `len`。翻转区间会颠倒区间内每对元素的先后次序，区间内部的逆序对数由 $inv_{old}$ 变为 $inv_{new}$ 且满足 $inv_{old} + inv_{new} = \frac{len(len-1)}{2}$；区间内外的元素对与区间外部的元素对都不受影响，因此全局逆序对数的变化量恰为 $inv_{new} - inv_{old}$。记翻转前后的全局逆序对数为 `oldValue` 与 `newValue`，联立得翻转前该区间的内部逆序对数
  $$
  inv_{old} = \frac{len(len-1)/2 + oldValue - newValue}{2}.
  $$

- **做法（探测）**：对每个 `i = 2..n` 连续调用两次 `ask(1, i)`：第一次翻转前缀 $[1, i]$ 并返回 `newValue`，第二次翻回并返回 `oldValue`，代入上式得前缀 $[1, i]$ 的逆序对数 $b[i] = \frac{i(i-1)/2 + oldValue - newValue}{2}$。两次翻转互为逆操作，每轮结束后排列恢复原状，故所有 `b[i]` 描述的都是原排列，且 $b[1] = 0$。

- **做法（排序）**：按 `i = 2..n` 依次把位置 `i` 上的元素并入已升序的前缀 $[1, i-1]$。差值 $x = b[i] - b[i-1]$ 是原排列中排在 `a[i]` 之前且大于它的元素个数；此前所有翻转都只重排 $[1, i-1]$ 内的元素、不改变位置 `i` 上的值，故该计数仍然成立，而这 `x` 个较大元素在升序前缀中恰好占据区间 $[i-x, i-1]$。`x > 0` 时先翻转 $[i-x, i]$，使 `a[i]` 移到这 `x` 个元素之前并把它们变为降序；再翻转 $[i-x+1, i]$ 把这 `x` 个元素复原为升序，于是 $[1, i]$ 升序。`x = 0` 时 `a[i]` 已在正确位置，无需翻转。

- **正确性**：每次插入后 $[1, i]$ 升序，归纳可知 `i = n` 时整个排列升序。探测阶段每 `i` 翻转两次、排序阶段每 `i` 至多翻转两次，总询问次数为 $O(n)$（不超过 $4(n-1) < 4n$ 次，满足限制）；逆序对数变为 0 时排列已经升序，`ask` 立即 `exit(0)` 使程序终止（协议要求），`n = 1` 时排列本就升序，代码执行一次 `ask(1, 1)` 结束交互。每次询问用 `endl` 立即刷新输出。计算部分的时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int ask(int l, int r) {
    cout << l << " " << r << endl;
    int x;
    cin >> x;
    if (x == 0)
        exit(0);
    return x;
}

void solve() {
    int n;
    cin >> n;
    vector<int> b(n + 1, 0);
    if (n == 1) {
        ask(1, 1);
        return;
    }
    for (int i = 2; i <= n; i++) {
        int newValue = ask(1, i);
        int oldValue = ask(1, i);
        b[i] = (i * (i - 1) / 2 + oldValue - newValue) / 2;
    }
    for (int i = 2; i <= n; i++) {
        int x = b[i] - b[i - 1];
        if (x > 0) {
            ask(i - x, i);
            ask(i - x + 1, i);
        }
    }
    cout << endl;
}
```

:::

## Bitwise Operations

### Counting Bits


**题目大意**：求 $1..n$ 的所有数的二进制表示中 1 的总个数（$n \le 10^{18}$）。

**解题思路**：按位统计。总 1 个数是各二进制位贡献之和：每个 1 恰好落在某一位上，把各位上「该位为 1 的数的个数」分别数出来再相加，不重不漏。对第 `b` 位，$0..n$ 这 $n+1$ 个数以 $2^{b+1}$ 为周期取值——每个完整周期内恰有 $2^b$ 个数该位为 1；末尾不足一个周期的 $r=(n+1)\bmod 2^{b+1}$ 个数中，前 $2^b$ 个该位为 0、其余为 1，贡献 $\max(0,\ r-2^b)$。故该位贡献为 $\lfloor (n+1)/2^{b+1}\rfloor\cdot 2^b+\max(0,\ r-2^b)$，代码对所有满足 $2^b\le n$ 的 `b` 累加（更高位恒为 0），0 本身不贡献 1。时间复杂度为 $O(\log n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    cin >> n;
    ll ans = 0;
    for (ll b = 0; (1LL << b) <= n; b++) {
        ll period = 1LL << (b + 1);
        ans += (n + 1) / period * (1LL << b) +
               max(0LL, (n + 1) % period - (1LL << b));
    }
    cout << ans << '\n';
}
```

:::

### Maximum Xor Subarray


**题目大意**：给 `n` 个数（$n \le 2 \times 10^5$），求异或和最大的连续子数组的异或和。

**解题思路**：前缀异或 + 二进制 Trie。记 $P_i$ 为前 $i$ 个数的异或和，则子数组 $[l,r]$ 的异或和为 $P_r\oplus P_{l-1}$，问题化为在所有已出现的前缀异或中找与当前前缀异或最大的值。扫描到 `x[i]` 时先用 `sum ^= x[i]` 得到新前缀，再以 `query(sum)` 在 Trie 上从高位到低位贪心：每层优先走与 `sum` 该位相反的分支，使结果这一位为 1——该位的权重高于其余所有低位之和，故这一步必是最优的；相反分支不存在时只能走相同分支。随后 `add(sum)` 把当前前缀插入 Trie，初始的 `add(0)` 代表空前缀，使 $l=1$ 的子数组也能被取到；答案取所有 `query(sum)` 的最大值。时间复杂度为 $O(n\log V)$，空间复杂度为 $O(n\log V)$。

:::details[题解(C++)]

```c++
const int N = 200001;
const int LOG_X = 30;
const int NODES = N * LOG_X;

int c[NODES][2], nodes = 1;

void add(int x) {
    int n = 0;
    for (int shift = LOG_X - 1; shift >= 0; --shift) {
        int bit = x >> shift & 1;
        if (!c[n][bit])
            c[n][bit] = nodes++;
        n = c[n][bit];
    }
}

int query(int x) {
    int n = 0, ret = 0;
    for (int shift = LOG_X - 1; shift >= 0; --shift) {
        int bit = ~x >> shift & 1;
        if (!c[n][bit]) {
            n = c[n][!bit];
        } else {
            ret += 1 << shift;
            n = c[n][bit];
        }
    }
    return ret;
}

int x[N];

void solve() {
    int n;
    cin >> n;

    int ans = 0, sum = 0;
    add(0);

    for (int i = 0; i < n; ++i) {
        cin >> x[i];
        sum ^= x[i];
        ans = max(ans, query(sum));
        add(sum);
    }

    cout << ans << '\n';
}
```

:::

### Maximum Xor Subset


**题目大意**：给 `n` 个数（$n \le 2 \times 10^5$，值可达 $2^{60}$ 级别），求任意子集（可空）异或和的最大值。

**解题思路**：

- **做法**：维护按最高位归档的线性基 `basis`。插入 `x` 时令 $b$ 从 62 递减到 0：若 `x` 的第 $b$ 位为 1 且 `basis[b] == 0`，就令 `basis[b] = x` 并结束这个数的插入；否则执行 `x ^= basis[b]` 消去该位后继续。求最大异或时令 `ans = 0`，同样令 $b$ 从 62 递减到 0，若 `ans ^ basis[b] > ans` 就令 `ans ^= basis[b]`。

- **正确性**：`x` 处理到第 $b$ 位时高于 $b$ 的位已被消去，故存入的 `basis[b]` 最高位恰为 $b$，各基向量的最高位互不相同；插入的每一步都保持 `basis` 中的向量与当前 `x` 共同张成的空间不变，故最终 `basis` 张成的空间就是全部子集异或的取值空间。取最大时，`basis[b]` 只影响不高于 $b$ 的位，所以 `ans ^ basis[b] > ans` 当且仅当 `ans` 的第 $b$ 位为 0——把该位置 1 的收益超过低位上的一切变化；而处理 `basis[b]` 时更高位已定型，之后处理的 `basis[c]`（$c<b$）也改动不到位 $b$，故每位只要能为 1 就置 1 是最优的，逐位贪心即得空间中的最大值。时间复杂度为 $O(60n)$，空间复杂度为 $O(1)$（`basis` 固定为 63 个元素）。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> basis(63, 0);
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        for (int b = 62; b >= 0; b--) {
            if (!(x >> b & 1))
                continue;
            if (!basis[b]) {
                basis[b] = x;
                break;
            }
            x ^= basis[b];
        }
    }
    ll ans = 0;
    for (int b = 62; b >= 0; b--)
        if ((ans ^ basis[b]) > ans)
            ans ^= basis[b];
    cout << ans << '\n';
}
```

:::

### Number of Subset Xors


**题目大意**：给 `n` 个数（值 $< 2^{63}$），求所有子集（含空集）异或能得到多少个不同的值。

**解题思路**：

- **观察**：所有子集异或的取值集合是对异或封闭的线性空间，恰为线性基 `basis` 张成的空间，其大小必为 $2^{rank}$（`rank` 为秩）。

- **正确性**：任一子集的异或等于 `basis` 中若干向量的异或（每个 `basis[b]` 本身是若干原数的异或），故不同取值至多 $2^{rank}$ 个；反过来，任取一组 0/1 系数把系数为 1 的基向量异或起来，其值等于相应原数并集的异或，即确实是某个子集能取到的值，故 $2^{rank}$ 种系数组合全部可达；又基向量线性无关，不同系数组合的结果必不相同。于是答案恰为 $2^{rank}$，插入时每成功放置一个基向量就令 `rank++`，最后输出 `1LL << rank`。时间复杂度为 $O(60n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> basis(63, 0);
    int rank = 0;
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        for (int b = 62; b >= 0; b--) {
            if (!(x >> b & 1))
                continue;
            if (!basis[b]) {
                basis[b] = x;
                rank++;
                break;
            }
            x ^= basis[b];
        }
    }
    cout << (1LL << rank) << '\n';
}
```

:::

### K Subset Xors


**题目大意**：给 `n` 个整数（$0 \le x_i \le 10^9$），把所有 $2^n$ 个子集的异或（含空集的 0，重复按多次计）从小到大排序，输出前 `k` 小的值。

**解题思路**：

- **做法**：先插入建线性基，再对 `b` 升序的每个非零 `basis[b]`，用所有 $c<b$ 的 `basis[c]` 消去它的低位 1——`basis[c]` 的最高位为 `c`，不会引入更高位，故消完后 `basis[b]` 只剩第 $b$ 位，即 $2^b$。把非零基向量按 `b` 升序收进 `red`，则第 `idx` 小的不同异或值 = 把 `idx` 的二进制 1 位映射到 `red` 上异或（`red[j]` 恰为 $2^{b_j}$，结果与 `idx` 在位模式上一致，已随 `idx` 严格递增）。每个不同值恰被 $2^{n-r}$ 个子集取到（$r$ 为秩）：把每个原数写成基向量上的坐标后，子集异或对应坐标求和，该映射的核大小为 $2^{n-r}$。故第 `i` 个输出 = 第 `i / mult` 个不同值，其中 `mult = 1LL << (n - red.size())`。

- **边界**：$n-r$ 较大时 `mult` 会超过 `k`，此时 `idx = i / mult` 恒为 0，前 `k` 个输出全为 0，索引计算不受影响；而 `mult` 由 `1LL << ...` 给出，移位位数达到 64 时这一移位本身会溢出，题目范围下不触发，属实现细节。总时间复杂度为 $O(60n+k\cdot r)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> basis(63, 0);
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        for (int b = 62; b >= 0; b--) {
            if (!(x >> b & 1))
                continue;
            if (!basis[b]) {
                basis[b] = x;
                break;
            }
            x ^= basis[b];
        }
    }

    for (int b = 0; b < 63; b++) {
        if (!basis[b])
            continue;
        for (int c = 0; c < b; c++)
            if (basis[b] >> c & 1)
                basis[b] ^= basis[c];
    }
    vector<ll> red;
    for (int b = 0; b < 63; b++)
        if (basis[b])
            red.push_back(basis[b]);

    ll mult = 1LL << (n - (int)red.size());
    for (ll i = 0; i < k; i++) {
        ll idx = i / mult;
        ll ans = 0;
        for (int j = 0; j < (int)red.size(); j++)
            if (idx >> j & 1)
                ans ^= red[j];
        cout << ans << '\n';
    }
}
```

:::

### All Subarray Xors


**题目大意**：给 `n` 个数（$0 \le x_i \le 10^6$），找出所有能作为某个连续子数组异或和的整数，先输出个数，再把它们去重后升序输出。

**解题思路**：

- **观察**：子数组 $[l,r]$ 的异或和等于两个前缀异或的异或，故可能取到的值就是前缀异或（含 $P_0=0$）两两异或的结果，问题化为对前缀异或的计数数组做异或卷积。

- **做法**：先用 `pref[i + 1] = pref[i] ^ x[i]` 求出前缀异或数组 `pref`，用 `f` 统计每个前缀异或值的出现次数，再对 `f` 做 FWHT 正变换、逐点平方、逆变换（每层除以 2）；三步之后 $f[v]$ 就是异或和为 $v$ 的有序前缀对数。接着执行 `f[0] -= (n+1)`，减去 $i=j$ 的 $n+1$ 个平凡对（它们对应空子数组），此后 $f[v]>0$ 即表示存在异或和为 $v$ 的非空子数组，按 $v$ 升序输出这些值与第一行的个数。

- **正确性**：FWHT 的蝴蝶变换把异或卷积对角化，故「正变换—逐点平方—逆变换」得到的正是自卷积 $f[v]=\sum_{a\oplus b=v}f[a]f[b]$（这里 $f$ 指变换前的计数数组）。每个非空子数组 $[l,r]$ 恰对应两个反向的前缀对 $(r,\ l-1)$ 与 $(l-1,\ r)$，它们都被计入 $f$，这不影响 $f[v]>0$ 的判据；前缀异或均小于 $2^{20}$，故变换长度取 $2^{20}$ 即可。总时间复杂度为 $O(2^{20}\cdot 20)$，空间复杂度为 $O(2^{20})$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> x(n);
    for (auto& v : x) cin >> v;

    vector<ll> pref(n + 1, 0);
    for (int i = 0; i < n; i++) pref[i + 1] = pref[i] ^ x[i];
    int N = 1 << 20;
    vector<ll> f(N, 0);
    for (ll v : pref) f[v]++;

    for (int len = 1; len < N; len <<= 1)
        for (int i = 0; i < N; i += len << 1)
            for (int j = 0; j < len; j++) {
                ll u = f[i + j], v = f[i + j + len];
                f[i + j] = u + v;
                f[i + j + len] = u - v;
            }
    for (int i = 0; i < N; i++) f[i] *= f[i];
    for (int len = 1; len < N; len <<= 1)
        for (int i = 0; i < N; i += len << 1)
            for (int j = 0; j < len; j++) {
                ll u = f[i + j], v = f[i + j + len];
                f[i + j] = (u + v) / 2;
                f[i + j + len] = (u - v) / 2;
            }
    f[0] -= (n + 1);
    vector<ll> res;
    for (int v = 0; v < N; v++)
        if (f[v] > 0)
            res.push_back(v);
    cout << res.size() << '\n';
    for (ll v : res) cout << v << ' ';
    cout << '\n';
}
```

:::

### Xor Pyramid Peak


**题目大意**：异或金字塔：每个数是其左下方、右下方两个数的异或。给定底层 `n` 个数（$n \le 2 \times 10^5$，$a_i \le 10^9$），求顶端那个数。

**解题思路**：

- **观察**：把顶端的数逐层展开成底层的异或后，底层 $a_i$ 的系数为 $\binom{n-1}{i-1}$（每向上一层，相邻两数合并，路径数即组合数），而异或只看次数的奇偶——出现偶数次即两两抵消，故系数为奇数时 $a_i$ 才真正参与。由 Lucas 定理，$\binom{m}{k}$ 为奇数当且仅当 $k$ 的每个二进制 1 位都是 $m$ 的 1 位（即 $k\subseteq m$），故 $a_i$ 参与当且仅当 $(i-1)\subseteq(n-1)$。

- **做法**：不必枚举全部子集，用「步长合并」原地完成子集异或：令 `cur = a`，对 `mask = n - 1` 的每个 1 位 `b` 取 `step = 1 << b`，对所有满足 `j + step < n` 的 `j` 执行 `cur[j] ^= cur[j + step]`，即把相距 $2^b$ 的位置合并一次；所有位处理完后 `cur[0]` 恰为所有满足 $i-1\subseteq n-1$ 的 `a[i-1]` 的异或。这就是 SOS（子集异或）的原地实现：每处理一个位，就把该位取 0 的状态的贡献并入该位取 1 的状态。时间复杂度为 $O(n\cdot\text{popcount}(n-1))$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;

    vector<ll> cur = a;
    int mask = n - 1;
    for (int b = 0; b < 20; b++) {
        if (!(mask >> b & 1))
            continue;
        int step = 1 << b;
        for (int j = 0; j + step < n; j++) cur[j] ^= cur[j + step];
    }
    cout << cur[0] << '\n';
}
```

:::

### Xor Pyramid Diagonal


**题目大意**：异或金字塔，给定底层 `n` 个数（$n \le 2 \times 10^5$），输出每一行（自底向上）最左边的那个数。

**解题思路**：

- **观察**：自底向上第 $r$ 行（$r=1..n$）第 $j$ 个位置（$j$ 从 0 起）的数是底层 $a_{j+t}$ 的异或，$t$ 取遍 $r-1$ 的全部子集：每个数由下层相邻两数合并而来，$a_{j+t}$ 的系数是 $\binom{r-1}{t}$，而异或只看系数奇偶、偶数次抵消。由 Lucas 定理，$\binom{r-1}{t}$ 为奇数当且仅当 $t\subseteq(r-1)$，于是第 $r$ 行最左端（$j=0$）的值 = 所有满足 $(i-1)\subseteq(r-1)$ 的 $a_i$（$i$ 从 1 起）的异或。

- **做法**：把底层存进 `a`，令 `dp[i] = a[i]`（$i<n$），数组长度补齐到 $N=2^{\lceil\log_2 n\rceil}$、其余 `dp` 位置为 0；对每一位 `b`，所有含位 `b` 的 `mask` 执行 `dp[mask] ^= dp[mask ^ (1 << b)]`。这就是子集 SOS：处理完全部位后 `dp[mask]` 等于所有 $sub\subseteq mask$ 的 `a[sub]` 的异或，故逐行输出 `dp[r-1]`（$r=1..n$）即答案。时间复杂度为 $O(2^{\lceil\log_2 n\rceil}\log n)$，空间复杂度为 $O(2^{\lceil\log_2 n\rceil})$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;

    int N = 1;
    while (N < n) N <<= 1;
    vector<ll> dp(N, 0);
    for (int i = 0; i < n; i++) dp[i] = a[i];
    for (int b = 0; b < 20; b++)
        for (int mask = 0; mask < N; mask++)
            if (mask >> b & 1)
                dp[mask] ^= dp[mask ^ (1 << b)];
    for (int r = 1; r <= n; r++) cout << dp[r - 1] << ' ';
    cout << '\n';
}
```

:::

### Xor Pyramid Row


**题目大意**：异或金字塔，给定底层 `n` 个数，输出从顶端数第 `k` 行的所有数（该行有 `k` 个数）。

**解题思路**：

- **观察**：从顶端数第 `k` 行自底向上数就是第 $r=n-k$ 行（$r$ 从 0 起）。每个数由下层相邻两数合并而来，故该行第 $j$ 个位置（$j$ 从 0 起）是底层 $a_{j+t}$ 的异或，$t$ 取遍 $r$ 的全部子集，其中 $a_{j+t}$ 的系数为 $\binom{r}{t}$；异或只看系数奇偶，由 Lucas 定理 $\binom{r}{t}$ 为奇数当且仅当 $t\subseteq r$，即该位置的值为所有 $t\subseteq(n-k)$ 的 `a[j+t]` 的异或。

- **做法**：用「步长合并」原地算出整行：令 `cur = a`，对 `mask = n - k` 的每个 1 位 `b` 取 `step = 1 << b`，对所有满足 `j + step < n` 的 `j` 执行 `cur[j] ^= cur[j + step]`；处理完后 `cur[j]`（$j<k$）即上述子集异或，输出前 `k` 个值 `cur[0..k-1]`。时间复杂度为 $O(n\cdot\text{popcount}(n-k))$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;

    vector<ll> cur = a;
    int mask = n - k;
    for (int b = 0; b < 20; b++) {
        if (!(mask >> b & 1))
            continue;
        int step = 1 << b;
        for (int j = 0; j + step < n; j++) cur[j] ^= cur[j + step];
    }
    for (int j = 0; j < k; j++) cout << cur[j] << ' ';
    cout << '\n';
}
```

:::

### SOS Bit Problem


**题目大意**：给 `n` 个数（$n \le 2 \times 10^5$，$a_i < 2^{20}$），对每个数 `x` 输出三个计数（`y` 均取遍这 `n` 个数）：满足 `x | y == x` 的个数、满足 `x & y == x` 的个数、满足 `x & y != 0` 的个数。

**解题思路**：用两次 SOS DP，分别做子集和与超集和。`F`、`G` 初值都是每个值的出现次数（代码先对每个 `A[i]` 执行 `F[A[i]]++`、`G[A[i]]++`）：对 `F` 做子集和——对每一位 `b`，所有含位 `b` 的 `mask` 执行 `F[mask] += F[mask ^ (1 << b)]`，做完后 $F[x]$ 即 $x$ 的子集个数，也就是第一问（`x | y == x` 当且仅当 `y` 是 `x` 的子集）；对 `G` 做超集和——对每一位 `b`，所有不含位 `b` 的 `mask` 执行 `G[mask] += G[mask ^ (1 << b)]`（即加上超集 `mask | (1 << b)` 的贡献），做完后 $G[x]$ 即 $x$ 的超集个数，也就是第二问（`x & y == x` 当且仅当 `y` 是 `x` 的超集）。第三问取补事件：`x & y == 0` 当且仅当 $y\subseteq\sim x$，而 $\sim x = ma - 1 - x$（`ma = 1 << 20`），故答案为 `n - F[ma - 1 - A[i]]`。时间复杂度为 $O(n+2^{20}\cdot 20)$，空间复杂度为 $O(2^{20})$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    int ma = (1 << 20);
    vector<int> F(ma, 0), A(n), G(ma, 0);
    for (int i = 1; i <= n; i++) cin >> A[i - 1];
    for (int i = 1; i <= n; i++) {
        F[A[i - 1]]++;
        G[A[i - 1]]++;
    }
    for (int i = 0; i < 20; i++)
        for (int j = 0; j < ma; j++)
            if ((j & (1 << i)))
                F[j] += F[j ^ (1 << i)];
    for (int i = 0; i < 20; i++)
        for (int j = 0; j < ma; j++)
            if (!(j & (1 << i)))
                G[j] += G[j ^ (1 << i)];
    for (int i = 0; i <= n - 1; i++)
        cout << F[A[i]] << " " << G[A[i]] << " " << n - F[ma - 1 - A[i]]
             << '\n';
}
```

:::

### And Subset Count


**题目大意**：给 `n` 个数（$0 \le a_i \le n$），对每个 `k = 0..n` 统计「元素按位与恰好等于 `k`」的非空子集个数，对 $10^9+7$ 取模。

**解题思路**：

- **观察**：先在 `cnt` 上做超集 SOS 求和，得到 $cnt[mask]$ = 满足 $a_i\supseteq mask$ 的元素个数；由这些元素组成的非空子集共 $2^{cnt[mask]}-1$ 个，其按位与都 $\supseteq mask$。反过来，若一个非空子集的按位与 $\supseteq mask$，则对 `mask` 的每个 1 位 `b`，子集内每个元素都含位 `b`（按位与在某位为 1 当且仅当参与子集的元素该位全为 1），即每个元素都 $\supseteq mask$。于是 $f[mask]=2^{cnt[mask]}-1$ 恰为「按位与 $\supseteq mask$」的子集数，即 $f[k]=\sum_{mask\supseteq k}g[mask]$，其中 $g[mask]$ 是按位与恰好等于 `mask` 的子集数。

- **做法**：在 `f` 上原地做超集莫比乌斯变换，把「超集前缀和」$f$ 还原为逐点值 $g$：对每一位 `b`，所有不含位 `b` 且 `mask | (1 << b) < N` 的 `mask` 执行 `f[mask] = (f[mask] - f[mask | (1 << b)] + MOD) % MOD`，其中 `N` 是大于 `n` 的最小 2 的幂（保证 `0..n` 都在数组内）。

- **正确性**：$f$ 是 $g$ 的超集前缀和，逐位差分按位独立地剥掉「含该位」那部分超集贡献，做完所有位后 `f[k]` 恰为按位与等于 `k` 的子集数，输出 `f[0..n]` 即全部答案。时间复杂度为 $O(n+N\log N)$，空间复杂度为 $O(N)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    int N = 1;
    while (N <= n) N <<= 1;

    vector<ll> cnt(N, 0);
    for (ll v : a) cnt[v]++;

    for (int b = 0; b < 20; b++)
        for (int mask = 0; mask < N; mask++)
            if (!(mask >> b & 1) && (mask | (1 << b)) < N)
                cnt[mask] += cnt[mask | (1 << b)];

    vector<ll> f(N);
    vector<ll> pw(n + 1, 1);
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * 2 % MOD;
    for (int mask = 0; mask < N; mask++)
        f[mask] = (pw[cnt[mask]] - 1 + MOD) % MOD;

    for (int b = 0; b < 20; b++)
        for (int mask = 0; mask < N; mask++)
            if (!(mask >> b & 1) && (mask | (1 << b)) < N) {
                f[mask] = (f[mask] - f[mask | (1 << b)] + MOD) % MOD;
            }
    for (int k = 0; k <= n; k++) cout << f[k] << ' ';
    cout << '\n';
}
```

:::

## Construction Problems

### Inverse Inversions


**题目大意**：给定 `n` 与 `k`（$1 \le n \le 10^6$，$0 \le k \le n(n-1)/2$），构造一个 $1..n$ 的排列 $p$，使其中恰有 `k` 个逆序对；逆序对指满足 $i<j$ 且 $p_i>p_j$ 的下标对。输出该排列，任意一组解均可。

**解题思路**：贪心逐位确定。用双指针维护当前最小可用值 `l` 与最大可用值 `r`，设当前位之后还剩 `left = n - i` 个位置。把 `r` 放在当前位时，它与后面 `left` 个数（都小于 `r`）各构成一个逆序对，恰好贡献 `left` 个逆序对，且与后面怎么排无关；把 `l` 放在当前位则不产生逆序对。因此 `left <= k` 时放 `r` 并执行 `k -= left`，否则放 `l`。不变量「还需制造的逆序对数不超过余下数字全部逆序时的最大值」在两种选择后都成立：放 `r` 后由 $k\le\binom{n-i+1}{2}$ 得 $k-left\le\binom{n-i}{2}$，放 `l` 时由 $k<left=n-i$ 同样得 $k\le\binom{n-i}{2}$。故构造不会中途失败。时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    ll k;
    cin >> n >> k;

    int l = 1, r = n;
    for (int i = 1; i <= n; ++i)
    {
        int left = n - i;

        if (left <= k)
        {
            k -= left;
            cout << r-- << ' ';
        }
        else
        {
            cout << l++ << ' ';
        }
    }
    cout << '\n';
}
```

:::

### Monotone Subsequences


**题目大意**：第一行给出测试组数 `t`（$1 \le t \le 1000$），之后每行两个整数 `n`、`k`（$1 \le k \le n \le 100$）。为每组构造一个 $1..n$ 的排列，使其最长单调子序列恰含 `k` 个数——单调子序列指数值递增或递减的子序列，二者取更长者；输出该排列，无解输出 IMPOSSIBLE。

**解题思路**：

- **观察**：由 Erdős–Szekeres 定理，$n>k^2$ 个互不相同的数中必存在长度 $k+1$ 的单调子序列，故 $n>k^2$ 时无解。

- **做法**：把 $1..n$ 从头开始按每 `k` 个数切成 $\lceil n/k\rceil$ 块（最后一块可以不足 `k` 个数），块内从大到小排列，各块按值域从小到大依次拼接成排列 `p`；代码用 `s`、`e` 表示每块的起止，把 $e,e-1,\dots,s$ 依次压入 `p`。

- **正确性**：块内严格递减，且某块中的任何数都小于其后所有块中的数，因此递减子序列只能落在单个块内、长度不超过 `k`；而首块恰有 `k` 个数且严格递减，故最长递减子序列长度恰为 `k`。递增子序列在每个递减块内至多取一个元素，长度不超过块数 $\lceil n/k\rceil$，由 $n\le k^2$ 得 $\lceil n/k\rceil\le k$。于是最长单调子序列长度恰为 `k`。每组时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n, k;
        cin >> n >> k;
        if (1LL * n > 1LL * k * k)
        {
            cout << "IMPOSSIBLE\n";
            continue;
        }
        vector<int> p;
        for (int s = 1; s <= n; s += k)
        {
            int e = min(s + k - 1, n);
            for (int v = e; v >= s; v--) p.push_back(v);
        }
        for (int x : p) cout << x << ' ';
        cout << '\n';
    }
}
```

:::

### Third Permutation


**题目大意**：给定两个 $1..n$ 的排列 `a`、`b`，并保证每个位置 $a_i \ne b_i$（$2 \le n \le 10^5$）。构造第三个 $1..n$ 的排列 `c`，使每个位置同时满足 $c_i \ne a_i$ 与 $c_i \ne b_i$；输出 `c`，任意一组解均可，无解输出 IMPOSSIBLE。

**解题思路**：

- **观察**：每个值 `v` 有两个禁位——它在 `a` 中的位置 `pa[v]` 与在 `b` 中的位置 `pb[v]`，可放 `v` 的位置就是余下的 $n-2$ 个。

- **做法**：按 `v = 1..n` 依次把 `v` 放进当前最靠前的合法空位：`avail` 存所有空位，未卡住时扫描至多越过 `v` 的两个禁位；若 `v` 的空位全是它的禁位（此时空位至多两个），就做夺位修复——取仍空的那个禁位 `p1`（`pa[v]` 为空则取 `pa[v]`，否则取 `pb[v]`），再按位置从小到大找第一个已占位置 `q`（其值为 `w`）满足 $p1 \notin \{pa[w],pb[w]\}$，把 `w` 挪到 `p1`、把 `v` 放进 `q`；找不到这样的 `w` 就输出 IMPOSSIBLE。

- **边界**：修复只保证 `w` 的新位置 `p1` 合法，`v` 落到的 `q` 是否合法由最后一步把关——代码逐位复验 $c_i \ne a_i$ 且 $c_i \ne b_i$，只要冲突就输出 IMPOSSIBLE。于是 IMPOSSIBLE 只有两条出口：找不到可搬动的 `w`，或复验不通过（$n=2$ 这类无解情形属于后者）。取值部分的总扫描步数为 $O(n)$，夺位修复每次需要 $O(n)$。总时间复杂度为 $O(n^2)$（大 $n$ 时修复极少触发），空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    for (auto &v : a) cin >> v;
    for (auto &v : b) cin >> v;
    vector<int> pa(n + 1), pb(n + 1);
    for (int i = 0; i < n; i++)
    {
        pa[a[i]] = i;
        pb[b[i]] = i;
    }

    vector<int> pos(n + 1, -1), usedAt(n, -1);
    set<int> avail;
    for (int i = 0; i < n; i++) avail.insert(i);
    for (int v = 1; v <= n; v++)
    {
        int p = -1;
        for (auto it = avail.begin(); it != avail.end() && p == -1; ++it)
        {
            if (*it != pa[v] && *it != pb[v]) p = *it;
        }
        if (p != -1)
        {
            pos[v] = p;
            usedAt[p] = v;
            avail.erase(p);
        }
        else
        {

            int p1 = pa[v];
            if (!avail.count(p1)) p1 = pb[v];

            int q = -1, w = -1;
            for (int i = 0; i < n; i++)
            {
                if (i == p1 || usedAt[i] == -1) continue;
                int ww = usedAt[i];
                if (pa[ww] != p1 && pb[ww] != p1)
                {
                    q = i;
                    w = ww;
                    break;
                }
            }
            if (w == -1)
            {
                cout << "IMPOSSIBLE\n";
                return;
            }

            pos[v] = q;
            usedAt[q] = v;
            pos[w] = p1;
            usedAt[p1] = w;
            avail.erase(p1);
        }
    }
    vector<int> c(n);
    for (int v = 1; v <= n; v++) c[pos[v]] = v;

    for (int i = 0; i < n; i++)
        if (c[i] == a[i] || c[i] == b[i])
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    for (int i = 0; i < n; i++) cout << c[i] << ' ';
    cout << '\n';
}
```

:::

### Permutation Prime Sums


**题目大意**：给定 `n`（$1 \le n \le 10^5$），构造两个 $1..n$ 的排列 `a`、`b`，使每个位置 $a_i + b_i$ 都是质数。输出两行，每行 `n` 个整数，分别为 `a` 与 `b`；无解输出 IMPOSSIBLE。

**解题思路**：

- **观察**：除 $1+1=2$ 外质数都是奇数，而奇数只能写成「奇数 + 偶数」，故除 $1$ 与 $1$ 的配对外，每个奇数都必须与一个偶数配对。`n` 为奇数时把 `1` 与 `1` 配成一对（和为 $2$），其余 $n-1$ 个数奇偶各半；`n` 为偶数时奇偶也各半。

- **做法**：先用埃氏筛打出 $2n+2$ 以内的质数表 `isP`（配对的和不超过 $2n$）。奇数从大到小处理：对每个奇数 `o`，在尚未使用的偶数里从大到小找使 $o+e$ 为质数的 `e`，先检查最大的 200 个候选，未命中再全量扫描；找不到则输出 IMPOSSIBLE。配对 $(o,e)$ 同时写入两个排列：`a[o-1] = o`、`b[o-1] = e` 与 `a[e-1] = e`、`b[e-1] = o`，即 `a` 是恒等排列，而 `b` 在每对内部把两个数互换。

- **边界**：`n = 1` 时直接输出两个 `1`（$1+1=2$ 是质数）；配对完成后代码逐位复验 $a_i + b_i$ 为质数，不满足则输出 IMPOSSIBLE。预处理时间复杂度为 $O(n \log\log n)$；每个奇数至多检查 200 个候选，兜底全扫描的最坏时间复杂度为 $O(n^2)$，实际几乎不触发。总时间复杂度为 $O(n \log\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    cin >> n;
    vector<bool> isP(2 * n + 3, true);
    isP[0] = isP[1] = false;
    for (int i = 2; i * i <= 2 * n + 2; i++)
        if (isP[i])
            for (int j = i * i; j <= 2 * n + 2; j += i) isP[j] = false;
    if (n == 1)
    {
        cout << "1\n1\n";
        return;
    }
    vector<int> a(n), b(n);
    int onePair = (n % 2 == 1);
    vector<int> odds, evens;
    for (int v = 1; v <= n; v++)
    {
        if (onePair && v == 1) continue;
        if (v % 2 == 1)
            odds.push_back(v);
        else
            evens.push_back(v);
    }
    vector<int> matchO(odds.size(), -1);
    set<int> avail(evens.begin(), evens.end());

    for (int i = (int)odds.size() - 1; i >= 0; i--)
    {
        int o = odds[i];
        bool got = false;
        int checked = 0;
        for (auto it = avail.rbegin(); it != avail.rend() && checked < 200; ++it, ++checked)
        {
            int e = *it;
            if (isP[o + e])
            {
                matchO[i] = e;
                avail.erase(e);
                got = true;
                break;
            }
        }
        if (!got)
        {

            for (auto it = avail.rbegin(); it != avail.rend(); ++it)
            {
                int e = *it;
                if (isP[o + e])
                {
                    matchO[i] = e;
                    avail.erase(e);
                    got = true;
                    break;
                }
            }
        }
        if (!got)
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    }
    if (onePair)
    {
        a[0] = 1;
        b[0] = 1;
    }
    for (int i = 0; i < (int)odds.size(); i++)
    {
        a[odds[i] - 1] = odds[i];
        b[odds[i] - 1] = matchO[i];
        a[matchO[i] - 1] = matchO[i];
        b[matchO[i] - 1] = odds[i];
    }
    for (int i = 0; i < n; i++)
        if (!isP[a[i] + b[i]])
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    cout << '\n';
    for (int i = 0; i < n; i++) cout << b[i] << ' ';
    cout << '\n';
}
```

:::

### Chess Tournament


**题目大意**：`n` 位棋手，编号 $1..n$，第 `i` 位希望恰好下 $x_i$ 盘棋（$n \le 10^5$，$\sum_i x_i \le 2 \times 10^5$），任意两位棋手之间至多对弈一盘。安排对局使每人参与的盘数正好等于 $x_i$：先输出对局总数 `k`，随后 `k` 行每行两个整数表示一场对局；无解输出 IMPOSSIBLE。

**解题思路**：

- **做法**：用大根堆 `nodes` 维护所有剩余需求为正的棋手，每轮取出剩余需求最大的 `s`，设其需求为 `d`。若堆内人数不足 `d`，则 `s` 找不到 `d` 个不同对手，输出 IMPOSSIBLE；否则弹出堆内需求最大的 `d` 人与 `s` 各对弈一盘、记入 `ans`，这 `d` 人的需求各减 1，减到 0 就不再入堆。全部处理完后先输出 `ans` 的长度（对局总数），再逐行输出每场对局。

- **正确性**：这是 Havel–Hakimi 判定的贪心形式——若安排可行，则把剩余需求最大的 `s` 与其余需求最大的 `d` 人配对后的需求序列仍可实现（交换论证），故贪心不会错过解；反之堆内人数不足 `d` 时确实无解。时间复杂度为 $O((n+\sum_i x_i) \log n)$，空间复杂度为 $O(n+\sum_i x_i)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    cin >> n;

    priority_queue<pair<int, int>> nodes;

    for (int i = 1; i <= n; ++i)
    {
        int deg;
        cin >> deg;
        if (deg > 0)
        {
            nodes.emplace(deg, i);
        }
    }

    vector<pair<int, int>> ans;

    while (!nodes.empty())
    {
        auto [d, s] = nodes.top();
        nodes.pop();
        if (nodes.size() < d)
        {
            cout << "IMPOSSIBLE" << '\n';
            return;
        }
        vector<pair<int, int>> others;
        for (int t = 1; t <= d; ++t)
        {
            others.push_back(nodes.top());
            nodes.pop();
        }
        for (auto [a, b] : others)
        {
            ans.emplace_back(s, b);
            if (a > 1)
            {
                nodes.emplace(a - 1, b);
            }
        }
    }

    cout << ans.size() << '\n';
    for (auto [a, b] : ans)
    {
        cout << a << ' ' << b << '\n';
    }
}
```

:::

### Distinct Sums Grid

**题目大意**：构造一个 $n \times n$ 的网格（$n \le 1000$），使 $1..n$ 每个整数恰好出现 $n$ 次，且全部 $2n$ 个行和与列和**两两不同**；无解则输出 `IMPOSSIBLE`。

**解题思路**：

- **观察**：行和加列和一共恰好 $2n$ 个，所以「互不相同」等价于两两不同。$n \le 3$ 无解：$n=1$ 时行和与列和都等于 $1$；$n=2$ 时每行恰含 $\{1,2\}$，两行行和都是 $3$；$n=3$ 穷举全部 $\frac{9!}{3!3!3!}=1680$ 种摆放也确实无解。$n=4$ 另有一组固定解。

- **做法**：$n \ge 5$ 时先令 `A[i][1] = n`，再令 $j > i$ 处 `A[i][j] = i`、$2 \le j \le i$ 处 `A[i][j] = i - 1`。这样值 $k$ 在行 $k$ 出现 $n-k$ 次、在行 $k+1$ 出现 $k$ 次，合计恰好 $n$ 次。此时行和是 $n + 1 + (n-2)i$，列和是 $n^2$（第一列）与 $n(n-1)/2 + (j-1)$（其余列），两者之间恰有一对 $(i, j)$ 取到相同值；代码用 `row` 逐行扫出这个 $j$，再交换 `A[2][1]` 与 `A[2][bj]`、`A[bi+1][n]` 与 `A[bi+2][n]`。

- **正确性**：交换后第一列的和变成 $n(n-1)+2$，比最大的行和 $n^2-n+1$ 还大，成为唯一的较大者；被修的那一列被推离原行和；`row[bi+1]` 加 $1$、`row[bi+2]` 减 $1$，而这两个格子都在第 $n$ 列，故列和 $col[n]$ 不变；其余和全部不动。于是 $2n$ 个和两两互异。

- **边界**：$n \le 3$ 输出 `IMPOSSIBLE`；$n = 4$ 直接查固定表；$n \ge 5$ 时那个唯一的交点必满足 $3 \le j \le n-1$ 与 $i+2 \le n$，两次交换都落在表内。总时间复杂度为 $O(n^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
static bool build3424(int n, vector<vector<int>> &A)
{
    if (n <= 3)
        return false;
    A.assign(n + 1, vector<int>(n + 1, 0));
    if (n == 4)
    {
        A[1] = {0, 3, 4, 4, 3};
        A[2] = {0, 2, 3, 4, 4};
        A[3] = {0, 1, 2, 2, 3};
        A[4] = {0, 1, 1, 1, 2};
        return true;
    }
    for (int i = 1; i <= n; i++)
    {
        A[i][1] = n;
        for (int j = 2; j <= n; j++)
            A[i][j] = (j > i) ? i : i - 1;
    }
    ll half = 1LL * n * (n - 1) / 2;
    int bi = -1, bj = -1;
    for (int i = 1; i <= n; i++)
    {
        ll row = (ll)n + 1 + 1LL * (n - 2) * i;
        ll j = row - half + 1;
        if (j >= 2 && j <= n)
        {
            bi = i;
            bj = (int)j;
            break;
        }
    }
    if (bi < 0)
        return false;
    swap(A[2][1], A[2][bj]);
    if (bi + 2 <= n)
        swap(A[bi + 1][n], A[bi + 2][n]);
    return true;
}

void solve()
{
    int n;
    cin >> n;
    vector<vector<int>> A;
    if (!build3424(n, A))
    {
        cout << "IMPOSSIBLE" << '\n';
        return;
    }
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= n; j++)
        {
            if (j > 1)
                cout << ' ';
            cout << A[i][j];
        }
        cout << '\n';
    }
}
```

:::

### Filling Trominos


**题目大意**：`t` 组测试（$t \le 100$），每组给出 $n, m$（$1 \le n, m \le 100$）。判断 $n \times m$ 的网格能否用 L 形三格骨牌不重不漏地铺满——每块覆盖 3 个格，形状为 $2 \times 2$ 缺一角；能则输出 `YES` 与 `n` 行、每行 `m` 个大写字母，同一骨牌的 3 个格字母相同，且相邻两格的字母相同当且仅当它们属于同一块骨牌；不能则输出 `NO`。

**解题思路**：

- **观察**：三条必要条件——面积 $nm$ 需能被 3 整除；最短边至少为 2（否则没有一行或一列放得下 L 形）；一边为 3 时另一边必须为偶数（$3\times$奇数的矩形无法铺满）。

- **做法**：先判掉上述无解情形；必要时转置网格使 `m` 为 3 的倍数（输出前再转回），以下 `n`、`m` 均指转置后的网格。然后按 `n` 分三类构造：

  - `n == 3`：此时必有 `m % 6 == 0`（`m` 为奇数与 `m % 6 == 3` 已在前面判掉），从左到右依次放 $3 \times 2$ 块（`put3x2` 把两块 L 形拼成 3 行 2 列）；

  - `n` 为偶数：每 2 行一组，组内从左到右放 $2 \times 3$ 块（`put2x3`）；

  - `n` 为奇数（$\ge 5$）：最上面 5 行交给 `put5row`，其余每 2 行一组用 `put2row` 铺。5 行带中：`m % 6 == 0` 时上 3 行放 $3 \times 2$、下 2 行放 $2 \times 3$；`m % 6 == 3` 时先在最左 9 列铺固定模板 `put5x9`（15 块 L 形），之后每 6 列重复「3 个 $3 \times 2$ + 2 个 $2 \times 3$」。

- **实现细节**：`place` 摆放一块骨牌时检查四邻已放骨牌的字母，从 `curId % 26` 起取第一个未出现的字母，从而保证相邻的不同骨牌字母不同；全部放完后代码检查没有残留空位（`.`）才输出 `YES`，否则输出 `NO`（该检查只作兜底）。每组时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
int n, m;
vector<string> g;
vector<vector<int>> bid;
int curId;

void place(int x, int y, const vector<pair<int, int>> &cells)
{
    bool used[26] = {false};
    for (auto &c : cells)
    {
        int dx[] = {0, 1, 0, -1}, dy[] = {1, 0, -1, 0};
        for (int d = 0; d < 4; d++)
        {
            int nx = c.first + dx[d], ny = c.second + dy[d];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && bid[nx][ny] != -1)
                used[g[nx][ny] - 'A'] = true;
        }
    }
    int ch = curId % 26;
    while (used[ch]) ch = (ch + 1) % 26;
    for (auto &c : cells)
    {
        g[c.first][c.second] = char('A' + ch);
        bid[c.first][c.second] = curId;
    }
    curId++;
}

void put2x3(int x, int y)
{
    place(x, y, {{x, y}, {x, y + 1}, {x + 1, y}});
    place(x, y, {{x, y + 2}, {x + 1, y + 1}, {x + 1, y + 2}});
}

void put3x2(int x, int y)
{
    place(x, y, {{x, y}, {x, y + 1}, {x + 1, y + 1}});
    place(x, y, {{x + 1, y}, {x + 2, y}, {x + 2, y + 1}});
}

void put5x9(int x, int y)
{
    place(x, y, {{x, y}, {x, y + 1}, {x + 1, y}});
    place(x, y, {{x, y + 2}, {x, y + 3}, {x + 1, y + 2}});
    place(x, y, {{x, y + 4}, {x, y + 5}, {x + 1, y + 4}});
    place(x, y, {{x, y + 6}, {x, y + 7}, {x + 1, y + 6}});
    place(x, y, {{x, y + 8}, {x + 1, y + 8}, {x + 1, y + 7}});
    place(x, y, {{x + 1, y + 1}, {x + 2, y}, {x + 2, y + 1}});
    place(x, y, {{x + 1, y + 3}, {x + 2, y + 3}, {x + 2, y + 4}});
    place(x, y, {{x + 1, y + 5}, {x + 2, y + 5}, {x + 2, y + 6}});
    place(x, y, {{x + 2, y + 2}, {x + 3, y + 1}, {x + 3, y + 2}});
    place(x, y, {{x + 2, y + 7}, {x + 2, y + 8}, {x + 3, y + 7}});
    place(x, y, {{x + 3, y}, {x + 4, y}, {x + 4, y + 1}});
    place(x, y, {{x + 3, y + 3}, {x + 4, y + 2}, {x + 4, y + 3}});
    place(x, y, {{x + 3, y + 4}, {x + 3, y + 5}, {x + 4, y + 4}});
    place(x, y, {{x + 3, y + 6}, {x + 4, y + 5}, {x + 4, y + 6}});
    place(x, y, {{x + 3, y + 8}, {x + 4, y + 7}, {x + 4, y + 8}});
}

void put5row(int x, int m)
{
    if (m % 6 == 0)
    {
        for (int y = 0; y < m; y += 2) put3x2(x, y);
        for (int y = 0; y < m; y += 3) put2x3(x + 3, y);
    }
    else
    {
        put5x9(x, 0);
        for (int y = 9; y < m; y += 6)
        {
            put3x2(x, y);
            put3x2(x, y + 2);
            put3x2(x, y + 4);
            put2x3(x + 3, y);
            put2x3(x + 3, y + 3);
        }
    }
}

void put2row(int x, int m)
{
    for (int y = 0; y < m; y += 3) put2x3(x, y);
}
void solve()
{
    int t;
    cin >> t;
    while (t--)
    {
        cin >> n >> m;
        if (1LL * n * m % 3 != 0 || min(n, m) < 2)
        {
            cout << "NO\n";
            continue;
        }

        if ((n == 3 && m % 2 == 1) || (m == 3 && n % 2 == 1))
        {
            cout << "NO\n";
            continue;
        }
        bool transposed = false;
        if (m % 3 != 0)
        {
            swap(n, m);
            transposed = true;
        }
        if (n == 3 && m % 6 == 3)
        {
            cout << "NO\n";
            continue;
        }
        if (n == 1)
        {
            cout << "NO\n";
            continue;
        }
        g.assign(n, string(m, '.'));
        bid.assign(n, vector<int>(m, -1));
        curId = 0;
        int x = 0;
        if (n == 3)
        {

            for (int y = 0; y < m; y += 2) put3x2(0, y);
        }
        else if (n % 2 == 0)
        {
            while (x < n)
            {
                put2row(x, m);
                x += 2;
            }
        }
        else
        {

            put5row(x, m);
            x += 5;
            while (x < n)
            {
                put2row(x, m);
                x += 2;
            }
        }

        bool full = true;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                if (g[i][j] == '.') full = false;
        if (!full)
        {
            cout << "NO\n";
            continue;
        }
        cout << "YES\n";
        if (!transposed)
        {
            for (auto &r : g) cout << r << '\n';
        }
        else
        {
            for (int i = 0; i < m; i++)
            {
                for (int j = 0; j < n; j++) cout << g[j][i];
                cout << '\n';
            }
        }
    }
}
```

:::

### Grid Path Construction

**题目大意**：$t$ 组询问（$t \le 100$），每组给一个 $n \times m$ 的网格（$n, m \le 50$）和两个格点 $a=(y_1,x_1)$、$b=(y_2,x_2)$；判断是否存在一条从 $a$ 到 $b$、恰好经过每个格子一次的路径，有则输出 `YES` 与移动串（`U` / `D` / `L` / `R`），无则输出 `NO`。

**解题思路**：

- **观察**：这是 Itai–Papadimitriou–Szwarcfiter 的经典问题，存在性没有统一的简单式子，要按棋盘染色与端点位置分类。把格子按 $x+y$ 的奇偶染成黑白：$nm$ 为奇数时 $a$、$b$ 必须同为白格，$nm$ 为偶数时必须异色；此外单行与单列都只有两个端点可行，$2 \times m$ 同列内部、$2 \times n$ 同行内部各有一类禁忌位置，$n = 3$（或 $m = 3$）且另一边为偶数时还有更细的限制。

- **做法**：把上述条件全部写进 `is_acceptable`，不满足就直接输出 `NO`。满足时用归约法构造：`build` 递归地把矩形切掉一条外围边带（`strip`）或在两个端点之间把矩形切开（`split`），每次把一个常数宽的条带路径拼接到内部解的某一条边上——拼接只改动条带与内部路径相接的那一个格子，用 `w` 覆盖该格原本的移动方向；只有当矩形缩小到常数规模时，才交给 `find` 里的 DFS 直接搜出一条路径。

- **正确性**：`is_acceptable` 里的判据是论文对网格图哈密顿路径存在性的分类结论。构造侧每一步都保持「子问题仍是同类型的网格哈密顿路径」这一不变量：`strip` / `split` 会先用 `is_acceptable` 验证两个子问题都可解，再改动相接的那一格把两部分连成一条路径；因此拼接后的路径仍恰好覆盖原矩形的每个格子且不重复。递归到底时 `find` 用穷举保证小矩形的解确实存在，再逐层向上拼接即可。

- **边界**：$1 \times m$ 与 $n \times 1$ 只接受两个端点；$1 \times 3$ 取中间点无解；$2 \times 2$ 对角无解而相邻有解；`find` 只在常数规模的小矩形上调用，并用 `prime` 记忆化避免重复搜索。每组时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
typedef long long LL;

class Hamilton_paths_in_grid_graphs {
public:
    bool is_acceptable(int n, int m, int x1, int y1, int x2, int y2) {
        if (x1 == x2 && y1 == y2) return false;

        if (n * m % 2 == 1 && (is_black(x1, y1) || is_black(x2, y2))) return false;
        if (n * m % 2 == 0 && (is_black(x1, y1) == is_black(x2, y2))) return false;

        if (n == 1 && !((y1 == 1 && y2 == m) || (y1 == m && y2 == 1))) return false;
        if (m == 1 && !((x1 == 1 && x2 == n) || (x1 == n && x2 == 1))) return false;

        if (n == 2 && m == 2) return true;
        if (n == 2 && x1 != x2 && (y1 == y2 && y1 != 1 && y1 != m)) return false;
        if (m == 2 && y1 != y2 && (x1 == x2 && x1 != 1 && x1 != n)) return false;

        if (n == 3 && m % 2 == 0) {
            if (is_black(x1, y1) && ((x1 == 2 && y1 < y2) || y1 < y2 - 1)) return false;
            if (!is_black(x1, y1) && ((x2 == 2 && y2 < y1) || y2 < y1 - 1)) return false;
        }
        if (m == 3 && n % 2 == 0) {
            if (is_black(x1, y1) && ((y1 == 2 && x1 < x2) || x1 < x2 - 1)) return false;
            if (!is_black(x1, y1) && ((y2 == 2 && x2 < x1) || x2 < x1 - 1)) return false;
        }
        return true;
    }
    void setup(int _n, int _m, int _x1, int _y1, int _x2, int _y2) {
        n = _n;
        m = _m;
        x1 = _x1;
        y1 = _y1;
        x2 = _x2;
        y2 = _y2;
        res = "";
        v = vector<vector<char>>(n + 2, vector<char>(m + 2));
        w = vector<vector<char>>(n + 2, vector<char>(m + 2));
    }

    void build_path() {
        build(n, m, x1, y1, x2, y2, 0, 0);
    }

    void print() {
        int j = 0;
        int x = x1;
        int y = y1;
        string res;
        while (j < n * m - 1) {
            if (w[x][y])
                res.push_back(w[x][y]);
            else
                res.push_back(v[x][y]);
            j++;
            for (int i = 0; i < 4; i++) {
                if (res.back() == l[i]) {
                    x += moves[i].first;
                    y += moves[i].second;
                    break;
                }
            }
        }
        cout << res << "\n";
    }

private:
    int n, m, x1, y1, x2, y2;
    vector<vector<char>> v, w;
    string res;
    const vector<pair<int, int>> moves = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    const vector<char> l = {'D', 'U', 'R', 'L'};
    map<tuple<int, int, int, int, int, int>, string> prime;

    bool is_black(int x, int y) {
        return (x + y) % 2 == 1;
    }

    void build(int n, int m, int x1, int y1, int x2, int y2, int sx, int sy) {
        if (strip(n, m, x1, y1, x2, y2, sx, sy)) return;
        if (split(n, m, x1, y1, x2, y2, sx, sy)) return;
        auto ans = find(n, m, x1, y1, x2, y2);
        int x = x1 + sx;
        int y = y1 + sy;
        for (auto c : ans) {
            v[x][y] = c;
            for (int i = 0; i < 4; i++) {
                if (c == l[i]) {
                    x += moves[i].first;
                    y += moves[i].second;
                    break;
                }
            }
        }
    }

    bool split(int n, int m, int x1, int y1, int x2, int y2, int sx, int sy) {
        if (n > 4 && x2 - x1 > 2) {
            for (int i = 1; i <= min(4, m); i++) {
                int nn = x1 + (x1 % 2 == 0 ? 2 : 1);
                if (is_acceptable(nn, m, x1, y1, nn, i) && is_acceptable(n - nn, m, 1, i, x2 - nn, y2)) {
                    build(nn, m, x1, y1, nn, i, sx, sy);
                    w[nn + sx][i + sy] = 'D';
                    build(n - nn, m, 1, i, x2 - nn, y2, sx + nn, sy);
                    return true;
                }
            }
        }
        if (n > 4 && x1 - x2 > 2) {
            for (int i = 1; i <= min(4, m); i++) {
                int nn = x2 + (x2 % 2 == 0 ? 2 : 1);
                if (is_acceptable(n - nn, m, x1 - nn, y1, 1, i) && is_acceptable(nn, m, nn, i, x2, y2)) {
                    build(n - nn, m, x1 - nn, y1, 1, i, sx + nn, sy);
                    w[1 + sx + nn][i + sy] = 'U';
                    build(nn, m, nn, i, x2, y2, sx, sy);
                    return true;
                }
            }
        }
        if (m > 4 && y2 - y1 > 2) {
            for (int i = 1; i <= min(4, n); i++) {
                int mm = y1 + (y1 % 2 == 0 ? 2 : 1);
                if (is_acceptable(n, mm, x1, y1, i, mm) && is_acceptable(n, m - mm, i, 1, x2, y2 - mm)) {
                    build(n, mm, x1, y1, i, mm, sx, sy);
                    w[i + sx][mm + sy] = 'R';
                    build(n, m - mm, i, 1, x2, y2 - mm, sx, sy + mm);
                    return true;
                }
            }
        }
        if (m > 4 && y1 - y2 > 2) {
            for (int i = 1; i <= min(4, n); i++) {
                int mm = y2 + (y2 % 2 == 0 ? 2 : 1);
                if (is_acceptable(n, m - mm, x1, y1 - mm, i, 1) && is_acceptable(n, mm, i, mm, x2, y2)) {
                    build(n, m - mm, x1, y1 - mm, i, 1, sx, sy + mm);
                    w[i + sx][1 + sy + mm] = 'L';
                    build(n, mm, i, mm, x2, y2, sx, sy);
                    return true;
                }
            }
        }
        return false;
    }

    bool strip(int n, int m, int x1, int y1, int x2, int y2, int sx, int sy) {
        for (int j = 0; j < 3; j++) {
            int minx = min(x1, x2) - 1 - j;
            if (minx > 1 && n - minx > 1) {
                if (is_acceptable(n - minx, m, x1 - minx, y1, x2 - minx, y2)) {
                    build(n - minx, m, x1 - minx, y1, x2 - minx, y2, sx + minx, sy);
                    for (int i = 1 + sy; i <= m + sy; i++) {
                        if (v[minx + 1 + sx][i] == 'L') {
                            build(minx, m, minx, i - sy, minx, i - 1 - sy, sx, sy);
                            w[minx + 1 + sx][i] = 'U';
                            w[minx + sx][i - 1] = 'D';
                            return true;
                        }
                        if (v[minx + 1 + sx][i] == 'R') {
                            build(minx, m, minx, i - sy, minx, i + 1 - sy, sx, sy);
                            w[minx + 1 + sx][i] = 'U';
                            w[minx + sx][i + 1] = 'D';
                            return true;
                        }
                    }
                }
            }
        }

        for (int j = 0; j < 3; j++) {
            int maxx = max(x1, x2) + j;
            if (maxx > 1 && n - maxx > 1) {
                if (is_acceptable(maxx, m, x1, y1, x2, y2)) {
                    build(maxx, m, x1, y1, x2, y2, sx, sy);
                    for (int i = 1 + sy; i <= m + sy; i++) {
                        if (v[maxx + sx][i] == 'L') {
                            build(n - maxx, m, 1, i - sy, 1, i - 1 - sy, sx + maxx, sy);
                            w[maxx + sx][i] = 'D';
                            w[maxx + 1 + sx][i - 1] = 'U';
                            return true;
                        }
                        if (v[maxx + sx][i] == 'R') {
                            build(n - maxx, m, 1, i - sy, 1, i + 1 - sy, sx + maxx, sy);
                            w[maxx + sx][i] = 'D';
                            w[maxx + 1 + sx][i + 1] = 'U';
                            return true;
                        }
                    }
                }
            }
        }

        for (int j = 0; j < 3; j++) {
            int miny = min(y1, y2) - 1 - j;
            if (miny > 1 && m - miny > 1) {
                if (is_acceptable(n, m - miny, x1, y1 - miny, x2, y2 - miny)) {
                    build(n, m - miny, x1, y1 - miny, x2, y2 - miny, sx, sy + miny);
                    for (int i = 1 + sx; i <= n + sx; i++) {
                        if (v[i][miny + 1 + sy] == 'D') {
                            build(n, miny, i - sx, miny, i + 1 - sx, miny, sx, sy);
                            w[i + 1][miny + sy] = 'R';
                            w[i][miny + 1 + sy] = 'L';
                            return true;
                        }
                        if (v[i][miny + 1 + sy] == 'U') {
                            build(n, miny, i - sx, miny, i - 1 - sx, miny, sx, sy);
                            w[i - 1][miny + sy] = 'R';
                            w[i][miny + 1 + sy] = 'L';
                            return true;
                        }
                    }
                }
            }
        }

        for (int j = 0; j < 3; j++) {
            int maxy = max(y1, y2) + j;
            if (maxy > 1 && m - maxy > 1) {
                if (is_acceptable(n, maxy, x1, y1, x2, y2)) {
                    build(n, maxy, x1, y1, x2, y2, sx, sy);
                    for (int i = 1 + sx; i <= n + sx; i++) {
                        if (v[i][maxy + sy] == 'D') {
                            build(n, m - maxy, i - sx, 1, i + 1 - sx, 1, sx, sy + maxy);
                            w[i + 1][maxy + 1 + sy] = 'L';
                            w[i][maxy + sy] = 'R';
                            return true;
                        }
                        if (v[i][maxy + sy] == 'U') {
                            build(n, m - maxy, i - sx, 1, i - 1 - sx, 1, sx, sy + maxy);
                            w[i - 1][maxy + 1 + sy] = 'L';
                            w[i][maxy + sy] = 'R';
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    string find(int n, int m, int x1, int y1, int x2, int y2) {
        auto it = prime.find({n, m, x1, y1, x2, y2});
        if (it != prime.end()) {
            return it->second;
        }
        string ans;
        vector<vector<bool>> odw(n + 1, vector<bool>(m + 1));
        auto dfs = [&](int x, int y, auto&& dfs) -> bool {
            bool res = false;
            if (x == x2 && y == y2) {
                if (int(ans.size()) == n * m - 1) return true;
                return false;
            }
            odw[x][y] = true;
            for (int i = 0; i < 4; i++) {
                const int a = moves[i].first;
                const int b = moves[i].second;
                if (x + a < 1 || x + a > n || y + b < 1 || y + b > m) continue;
                if (odw[x + a][y + b] == false) {
                    ans.push_back(l[i]);
                    if (dfs(x + a, y + b, dfs)) {
                        return true;
                    } else {
                        ans.pop_back();
                    }
                }
            }
            odw[x][y] = false;
            return res;
        };
        dfs(x1, y1, dfs);
        prime[{n, m, x1, y1, x2, y2}] = ans;
        return ans;
    }
};
void solve()
{
    int tt;
    cin >> tt;
    Hamilton_paths_in_grid_graphs h;
    while (tt--)
    {
        int n, m, x1, y1, x2, y2;
        cin >> n >> m >> x1 >> y1 >> x2 >> y2;
        h.setup(n, m, x1, y1, x2, y2);
        if (!h.is_acceptable(n, m, x1, y1, x2, y2))
            cout << "NO" << '\n';
        else
        {
            cout << "YES" << '\n';
            h.build_path();
            h.print();
        }
    }
}
```

:::
