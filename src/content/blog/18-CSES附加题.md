---
title: "CSES 附加题"
description: "本篇包含：Additional Problems I（30 题）、Additional Problems II（30 题）。共 60 题。"
pubDate: 2026-05-07T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/18.jpg"
---
本篇包含：Additional Problems I（30 题）、Additional Problems II（30 题）。共 60 题。



## Additional Problems I

### Shortest Subsequence


**题目大意**：给定一个只含 `A`、`C`、`G`、`T` 四种字符的 DNA 串（长度 $n \le 10^6$），求一个最短的、不作为该串子序列出现的字符串并输出（若有多个，输出任意一个即可）。

**解题思路**：

- **做法**：从左到右扫描串，同时统计四种字符在当前块内的出现次数；一旦四种字符都至少出现一次，说明一个完整块结束——把当前字符追加到答案 `t` 末尾并清零四个计数器。扫描结束后，把残余部分里还没出现过的字符追加到 `t` 末尾（按 A、C、G、T 的顺序取第一个缺失的）。答案长度 = 完整块数 + 1。

- **正确性**：① 构造出的 `t` 不是 `s` 的子序列：每个完整块的收尾字符在该块内恰好出现一次、且位于块末（一凑齐就立刻追加并清零），所以 `t` 的第 $i$ 个字符在 `s` 中任何匹配位置都被逼到第 $i$ 块末尾或之后，匹配位置只能逐块后移；最后追加的字符是残余部分里缺失的字符，此时前面可用的匹配位置都已耗尽，整串不可能匹配完。② 最优性：设完整块数为 $m$，则任何长度不超过 $m$ 的串都是 `s` 的子序列——从后往前匹配：第 $m$ 块包含全部四种字符，待匹配串的最后一个字符一定能落在第 $m$ 块内；倒数第二个字符落在第 $m-1$ 块内（该块同样包含全部四种字符，且整块都在已匹配位置之前），依此类推。所以最短的不可匹配串长度恰为 $m+1$，与构造相同。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
string s;
void solve() {
    int a = 0, b = 0, c = 0, d = 0;
    cin >> s;
    string t = "";
    for (auto i : s) {
        if (i == 'A')
            a++;
        else if (i == 'C')
            b++;
        else if (i == 'G')
            c++;
        else
            d++;
        int z = min({a, b, c, d});
        if (z) {
            t += i;
            a = b = c = d = 0;
        }
    }
    if (a == 0)
        t += "A";
    else {
        if (b == 0)
            t += "C";
        else {
            if (c == 0)
                t += "G";
            else
                t += "T";
        }
    }
    cout << t << '\n';
}
```

:::

### Distinct Values Sum


**题目大意**：给定长度为 $n$（$n \le 2 \times 10^5$）的数组 $x_1,\dots,x_n$，设 $d(a,b)$ 表示子数组 $x_a,\dots,x_b$ 中不同值的个数，求所有子数组的 $d(a,b)$ 之和。

**解题思路**：按位置统计贡献。固定位置 `i`（从 1 开始），记 `prev` 为 `i` 之前与 $x_i$ 相同的最近位置（没出现过则记 0）：当且仅当左端点取 $[prev+1,\,i]$ 中任意位置（共 $i-prev$ 种）时，$x_i$ 是该子数组中第一次出现的 $x_i$，此时右端点可在 $[i,\,n]$ 中任取（$n-i+1$ 种）。又因为每个子数组的不同值个数恰好等于其中“属于首次出现”的位置个数，所以答案为 $\sum_i (i-prev_i)(n-i+1)$。实现上用哈希表记录每个值上次出现的位置（$x_i$ 可到 $10^9$，不能开数组），边读边累加。答案最大约为 $n^3/6$，需要用 64 位整数。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    unordered_map<ll, int> last;
    ll ans = 0;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        int prev = last.count(x) ? last[x] : 0;
        ans += 1LL * (i - prev) * (n - i + 1);
        last[x] = i;
    }
    cout << ans << '\n';
}
```

:::

### Distinct Values Splits


**题目大意**：给定一个数组，把它切成若干连续段，要求每段内部的元素互不相同，求合法切法的数量，对 $10^9+7$ 取模。

**解题思路**：DP 配双指针。设 `dp[i]` 为前缀 $x_1,\dots,x_i$ 的合法切法数，`dp[0] = 1` 对应空前缀。若最后一段是 $[j,i]$，它内部必须无重复元素；用双指针维护“当前无重复窗口的最左端 `L`”：把 $x_i$ 计入窗口计数 `cnt` 后，只要 $x_i$ 在窗口内出现超过一次，就不断把 `L` 处的计数减一并右移 `L`，直到窗口重新无重复。此时合法的最后一段起点是 $j\in[L,i]$，转移为 $dp[i]=\sum_{j=L}^{i}dp[j-1]$；再用前缀和 `pref` 把它写成 $O(1)$：`dp[i] = pref[i-1] - pref[L-2]`，其中 $L=1$ 时 `pref[-1]` 不存在，这一项取 0（代码写作 `L >= 2 ? pref[L - 2] : 0`）。所有下标从 1 开始，减法后要加模数再取模。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int MOD = 1e9 + 7;

void solve() {
    int n;
    cin >> n;
    vector<ll> x(n + 1);
    for (int i = 1; i <= n; i++) cin >> x[i];
    vector<ll> dp(n + 2, 0), pref(n + 2, 0);
    dp[0] = 1;
    pref[0] = 1;
    unordered_map<ll, int> cnt;
    int L = 1;
    for (int i = 1; i <= n; i++) {
        cnt[x[i]]++;
        while (cnt[x[i]] > 1) {
            cnt[x[L]]--;
            L++;
        }
        dp[i] = (pref[i - 1] - (L >= 2 ? pref[L - 2] : 0) + MOD) % MOD;
        pref[i] = (pref[i - 1] + dp[i]) % MOD;
    }
    cout << dp[n] << '\n';
}
```

:::

### Swap Game


**题目大意**：给出 $3\times3$ 网格中 $1..9$ 的一个排列（三行、每行三个整数，没有空格），一次操作可以交换任意两个上下或左右相邻的数字，求把局面变成第一行 1 2 3、第二行 4 5 6、第三行 7 8 9 所需的最少操作次数。

**解题思路**：BFS 最短路。把局面存成 9 个字符的数组 `grid`，用 `grid_hash` 按 9 进制编码成整数当哈希键：每位取 `g[i] - '1'` $\in[0,8]$，故最大编码值 $9^9-1<2^{31}$，可以直接用 `int` 做键；`GOAL` 是目标局面的字符数组。从初始局面入队开始 BFS，出队时若等于 `GOAL` 就输出 `dist`（初始局面即目标时输出 0）；否则枚举 `SWAP` 中预定义的 12 组相邻格子对，交换两个字符生成新局面，用 `unordered_map` 判重后入队，`dist` 记录最短距离。网格图连通，沿边交换可以生成全部 $9!$ 种排列，因此目标局面必定可达，不需要处理无解。状态总数不超过 $9!$，每个状态至多 12 条转移。时间复杂度为 $O(9!\cdot 12)$，空间复杂度为 $O(9!)$。

:::details[题解(C++)]

```c++
const int N = 3;
using grid = array<char, N * N>;
const grid GOAL = {'1', '2', '3', '4', '5', '6', '7', '8', '9'};

const int SWAP[][2] = {{0, 1}, {0, 3}, {1, 2}, {1, 4}, {2, 5}, {3, 4},
                       {3, 6}, {4, 5}, {4, 7}, {5, 8}, {6, 7}, {7, 8}};

int grid_hash(grid& g) {
    int h = 0;
    for (int i = 0; i < N * N; ++i) {
        h = h * 9 + (g[i] - '1');
    }
    return h;
}
void solve() {
    grid s;
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            cin >> s[i * N + j];
        }
    }

    vector<grid> q{s};
    unordered_map<int, int> dist;
    dist[grid_hash(s)] = 0;

    for (int qi = 0; qi < q.size(); ++qi) {
        auto cur = q[qi];
        if (cur == GOAL) {
            cout << dist[grid_hash(cur)] << '\n';
            return;
        }
        for (auto [i, j] : SWAP) {
            auto nxt = cur;
            swap(nxt[i], nxt[j]);
            if (!dist.count(grid_hash(nxt))) {
                dist[grid_hash(nxt)] = dist[grid_hash(cur)] + 1;
                q.push_back(nxt);
            }
        }
    }
}
```

:::

### Beautiful Permutation II


**题目大意**：给定 $n$（$n \le 10^6$），构造字典序最小的 $1..n$ 的排列，使任意相邻两项之差的绝对值都不等于 1；不存在这样的排列时输出 `NO SOLUTION`。

**解题思路**：

- **做法**：按位置从左到右贪心填数。已放置的序列记为 `res`、已用标记记为 `used`；在 `dfs(depth)` 中从小到大枚举尚未使用的值 `v`，要求 $|v-res[depth-1]| \ne 1$（`depth = 0` 时没有限制），放下后调用 `feasible(v)` 检验“剩余的值能否接得下去”。`feasible(last)` 先把未使用的值收进 `rem`：`rem` 为空直接返回 true；`rem` 大小超过 12 也直接返回 true（剩余规模较大时总能排好）；否则把 `rem` 升序排序后用 `next_permutation` 枚举它的所有排列，检查每相邻两项之差不等于 1、且首项与 `last` 之差不等于 1，一旦找到就返回 true。只有 `feasible` 通过才继续递归，第一次填满 `n` 个数即为答案。

- **正确性**：每一步都在所有可行分支里取最小的可用值，而剪枝只在“剩余值确实能排好”时才放行，不会误杀可行分支，所以首次填满得到的排列就是字典序最小解。

- **边界**：$n=1$ 时答案为 1（直接特判）；$n=2,3$ 时任何排列都存在相邻差为 1 的两项，输出 `NO SOLUTION`；$n\ge4$ 时一定有解。精确枚举只在剩余值不超过 12 个（DFS 最后若干层）时触发。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int n;
vector<int> used;
vector<int> res;
bool feasible(int last) {
    vector<int> rem;
    for (int v = 1; v <= n; v++)
        if (!used[v])
            rem.push_back(v);
    int m = rem.size();
    if (m == 0)
        return true;
    if (m > 12)
        return true;
    sort(rem.begin(), rem.end());
    do {
        bool ok = true;
        if (abs(rem[0] - last) == 1)
            ok = false;
        for (int i = 1; i < m && ok; i++)
            if (abs(rem[i] - rem[i - 1]) == 1)
                ok = false;
        if (ok)
            return true;
    } while (next_permutation(rem.begin(), rem.end()));
    return false;
}
bool dfs(int depth) {
    if (depth == n)
        return true;
    for (int v = 1; v <= n; v++) {
        if (!used[v] && (depth == 0 || abs(v - res[depth - 1]) != 1)) {
            used[v] = 1;
            res.push_back(v);
            if (feasible(v) && dfs(depth + 1))
                return true;
            res.pop_back();
            used[v] = 0;
        }
    }
    return false;
}
void solve() {
    cin >> n;
    if (n == 1) {
        cout << 1 << '\n';
        return;
    }
    if (n < 4) {
        cout << "NO SOLUTION\n";
        return;
    }
    used.assign(n + 1, 0);
    if (dfs(0)) {
        for (int v : res) cout << v << ' ';
        cout << '\n';
    } else
        cout << "NO SOLUTION\n";
}
```

:::

### Multiplication Table


**题目大意**：给定奇数 $n$（$n < 10^6$），把 $n\times n$ 乘法表（第 `i` 行第 `j` 列的数为 $i\cdot j$）中的 $n^2$ 个数按升序排列，求中位数。

**解题思路**：二分答案。`check(x)` 统计表中不超过 `x` 的元素个数：第 `i` 行恰有 $\min(n,\lfloor x/i\rfloor)$ 个，逐行累加即可；这个计数关于 `x` 单调不减，因此可以二分。$n$ 为奇数时 $n^2$ 为奇数，中位数是升序第 $n^2/2+1$ 个元素，而“第 $k$ 小的值”等于满足 $\text{count}(x)\ge k$ 的最小 `x`，代码里 `n * n / 2 + 1` 的整除结果正好是 $(n^2+1)/2$。二分区间取 $[1,\,n^2]$。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    cin >> n;

    auto check = [&](ll x) {
        ll amount = 0;
        for (int i = 1; i <= n; ++i) {
            amount += min(n, x / i);
        }

        return amount >= n * n / 2 + 1;
    };

    ll l = 1, r = n * n;
    while (l < r) {
        ll mid = (l + r) / 2;
        if (check(mid)) {
            r = mid;
        } else {
            l = mid + 1;
        }
    }

    cout << l << '\n';
}
```

:::

### Bubble Sort Rounds I


**题目大意**：给定长度为 $n$ 的数组（$n \le 2 \times 10^5$）。一轮冒泡排序指“从左到右扫描，遇到相邻两个元素逆序就交换”。求把数组排成非降序需要多少轮。

**解题思路**：每个元素每轮至多向左移动一位；而只要它左边还存在比它大的元素，这一轮它就会左移一位。因此元素所需轮数恰为“它左侧比它大的元素个数”，总轮数就是所有元素该值的最大值。实现：把下标与值一起按值升序排序（相同值按下标升序，保证同一值的左侧元素先被处理），依次处理每个元素 `v[i]`（`i` 从 0 计数），把它的位置 `pos = v[i].second + 1` 插入位置维度的树状数组 `bit`。处理时已插入的恰好是排序中排在它前面的那 `i` 个元素——值更小的全部，以及相同值里位置更靠左的；`qry(pos)` 给出其中位于它左侧的个数，而它左侧共有 `pos - 1` 个位置，所以它左侧比它大的元素个数为 `pos - 1 - qry(pos)`。对每个元素算出 `g` 后更新 `ans = max(ans, g)`。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<pair<long long, int>> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i].first;
        v[i].second = i;
    }
    sort(v.begin(), v.end());
    vector<int> bit(n + 2, 0);
    auto add = [&](int i, int d) {
        for (; i <= n; i += i & -i) bit[i] += d;
    };
    auto qry = [&](int i) {
        int s = 0;
        for (; i > 0; i -= i & -i) s += bit[i];
        return s;
    };
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int pos = v[i].second + 1;
        int g = pos - 1 - qry(pos);
        ans = max(ans, g);
        add(pos, 1);
    }
    cout << ans << '\n';
}
```

:::

### Bubble Sort Rounds II


**题目大意**：给定长度为 $n$ 的数组（$n \le 2 \times 10^5$）和轮数 `k`，输出经过 `k` 轮冒泡排序（每轮从左到右扫描，相邻逆序即交换）后的数组。

**解题思路**：一轮扫描里元素向左至多移动一位、向右可以移动任意多位，所以 `k` 轮后数组第 `i` 个位置（`i` 从 0 起）一定由原数组下标不超过 $\min(n-1,\,i+k)$ 的元素占据，并且它取这些可到达元素中第 $i+1$ 小的值。于是用最小堆模拟：先把下标 $0$ 到 $\min(n-1,k)$ 的元素入堆；再对 `i = 0..n-1` 依次输出堆顶并弹出，每弹出一个就把下标 `i+k+1`（未越界时）的元素入堆。堆里始终是能到达当前位置的那些元素，堆顶即该位置的值。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> x(n);
    for (auto& v : x) cin >> v;
    priority_queue<ll, vector<ll>, greater<ll>> pq;
    for (int i = 0; i <= min((ll)n - 1, k); i++) pq.push(x[i]);
    for (int i = 0; i < n; i++) {
        cout << pq.top() << ' ';
        pq.pop();
        if (i + k + 1 < n)
            pq.push(x[i + k + 1]);
    }
    cout << '\n';
}
```

:::

### Nearest Campsites I


**题目大意**：平面上有 `n` 个保留营地与 `m` 个免费营地（给出各点坐标），两点距离取曼哈顿距离 $|x_1-x_2|+|y_1-y_2|$。对每个免费营地求它到最近保留营地的距离，输出这些距离中的最大值。

**解题思路**：

- **观察**：曼哈顿距离可以按象限拆开。以“保留点在免费点左下方”为例，此时 $|x_f-x_r|+|y_f-y_r|=(x_f+y_f)-(x_r+y_r)$，问题变成在满足 $x_r\le x_f$、$y_r\le y_f$ 的保留点中最大化 $x_r+y_r$。把坐标按 $(\pm1,\pm1)$ 四种符号翻折（`sx`、`sy`），四种象限情形就统一成同一个形状：在变换后“两个坐标都不超过免费点”的点集中最大化变换后的坐标和。四个方向各求一次、取最小值，就覆盖了所有保留点。

- **做法**：每个方向做一遍扫描线。先把保留点的 $y\cdot sy$ 离散化（排序去重，`gi` 给出某个 $y$ 对应的 1 起下标）；再把保留点与免费点一起做成事件按变换后的 `x` 升序排序：第一关键字是 `x*sx`、第二关键字是类型（保留点 `type = 0`、免费点 `type = 1`），同一 `x` 下类型小的先处理，这样 $x_r=x_f$ 的保留点也会被统计到；保留点事件还带着 $x_r\cdot sx+y_r\cdot sy$，免费点事件带着自己的编号。扫描中保留点把变换后的坐标和插入树状数组（按 $y\cdot sy$ 的下标做前缀最大值），免费点则查询前缀最大值 `best`：查到就用 $(x_f\cdot sx+y_f\cdot sy)-best$ 更新该免费营地的候选距离。四个方向取最小得到每个免费营地的答案，最后对它们取最大值输出。

- **边界**：树状数组初值取足够小的负数（如 `-4e18`）表示“该前缀还没有保留点”，查询结果仍为该值时跳过该方向；坐标相等的情形由“保留点先于免费点”的顺序与“前缀查询包含相等下标”共同保证。总时间复杂度为 $O((n+m)\log(n+m))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
struct BIT {
    int n;
    vector<long long> t;
    BIT(int n) : n(n), t(n + 2, -4e18) {}
    void add(int i, long long v) {
        for (; i <= n; i += i & -i) t[i] = max(t[i], v);
    }
    long long qry(int i) {
        long long r = -4e18;
        for (; i > 0; i -= i & -i) r = max(r, t[i]);
        return r;
    }
};
void solve() {
    int n, m;
    cin >> n >> m;
    vector<pair<int, int>> R(n), F(m);
    for (auto& p : R) cin >> p.first >> p.second;
    for (auto& p : F) cin >> p.first >> p.second;
    vector<int> ans(m, INT_MAX);
    for (int dir = 0; dir < 4; dir++) {
        int sx = dir % 2 == 0 ? 1 : -1, sy = dir / 2 == 0 ? 1 : -1;
        vector<int> ys;
        for (auto& p : R) ys.push_back(p.second * sy);
        for (auto& p : F) ys.push_back(p.second * sy);
        sort(ys.begin(), ys.end());
        ys.erase(unique(ys.begin(), ys.end()), ys.end());
        auto gi = [&](int y) {
            return lower_bound(ys.begin(), ys.end(), y) - ys.begin() + 1;
        };
        vector<tuple<int, int, int, int>> ev;
        for (int i = 0; i < n; i++)
            ev.push_back({R[i].first * sx, 0, R[i].second * sy,
                          R[i].first * sx + R[i].second * sy});
        for (int i = 0; i < m; i++)
            ev.push_back({F[i].first * sx, 1, F[i].second * sy, i});
        sort(ev.begin(), ev.end());
        BIT bit(ys.size());
        for (auto& e : ev) {
            if (get<1>(e) == 0)
                bit.add(gi(get<2>(e)), get<3>(e));
            else {
                long long best = bit.qry(gi(get<2>(e)));
                if (best > -4e18) {
                    int idx = get<3>(e);
                    ans[idx] = min(ans[idx], (int)(F[idx].first * sx +
                                                   F[idx].second * sy - best));
                }
            }
        }
    }
    int mx = 0;
    for (int i = 0; i < m; i++) mx = max(mx, ans[i]);
    cout << mx << '\n';
}
```

:::

### Nearest Campsites II


**题目大意**：平面上有 `n` 个保留营地与 `m` 个免费营地（给出各点坐标），两点距离取曼哈顿距离 $|x_1-x_2|+|y_1-y_2|$。对每个免费营地求它到最近保留营地的距离，并按输入顺序输出。

**解题思路**：

- **观察**：$|x_f-x_r|+|y_f-y_r|$ 在保留点位于免费点的某个象限时可以直接去掉绝对值。例如 $x_r\le x_f$、$y_r\le y_f$ 时它就等于 $(x_f+y_f)-(x_r+y_r)$，于是只需在“两个坐标都不超过免费点”的保留点中最大化坐标和。把坐标分别乘 $(\pm1,\pm1)$ 翻折（`sx`、`sy`），四种情形共用同一套处理：在变换后“两个坐标都不超过”的点集中求变换坐标和的最大值。

- **做法**：每个方向做一次扫描线。先把保留点的 $y\cdot sy$ 离散化（`gi` 给出 1 起下标），再把两类点做成事件按变换后的 `x` 升序排序（保留点 `type = 0` 排在前面，保证 `x` 相等的保留点也被统计）；用树状数组维护按 $y\cdot sy$ 下标的前缀最大值：遇到保留点插入 $x_r\cdot sx+y_r\cdot sy$，遇到免费点查询 `best`，得到候选值 $(x_f\cdot sx+y_f\cdot sy)-best$。四个方向取最小即该免费营地的距离，最后按输入顺序逐个输出。

- **边界**：查询结果仍是初始极小值时说明该方向没有可用保留点，跳过；`ans` 初始化为 `INT_MAX` 便于取最小。总时间复杂度为 $O((n+m)\log(n+m))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
struct BIT {
    int n;
    vector<long long> t;
    BIT(int n) : n(n), t(n + 2, -4e18) {}
    void add(int i, long long v) {
        for (; i <= n; i += i & -i) t[i] = max(t[i], v);
    }
    long long qry(int i) {
        long long r = -4e18;
        for (; i > 0; i -= i & -i) r = max(r, t[i]);
        return r;
    }
};
void solve() {
    int n, m;
    cin >> n >> m;
    vector<pair<int, int>> R(n), F(m);
    for (auto& p : R) cin >> p.first >> p.second;
    for (auto& p : F) cin >> p.first >> p.second;
    vector<int> ans(m, INT_MAX);
    for (int dir = 0; dir < 4; dir++) {
        int sx = dir % 2 == 0 ? 1 : -1, sy = dir / 2 == 0 ? 1 : -1;
        vector<int> ys;
        for (auto& p : R) ys.push_back(p.second * sy);
        for (auto& p : F) ys.push_back(p.second * sy);
        sort(ys.begin(), ys.end());
        ys.erase(unique(ys.begin(), ys.end()), ys.end());
        auto gi = [&](int y) {
            return lower_bound(ys.begin(), ys.end(), y) - ys.begin() + 1;
        };
        vector<tuple<int, int, int, int>> ev;
        for (int i = 0; i < n; i++)
            ev.push_back({R[i].first * sx, 0, R[i].second * sy,
                          R[i].first * sx + R[i].second * sy});
        for (int i = 0; i < m; i++)
            ev.push_back({F[i].first * sx, 1, F[i].second * sy, i});
        sort(ev.begin(), ev.end());
        BIT bit(ys.size());
        for (auto& e : ev) {
            int type = get<1>(e);
            if (type == 0) {
                bit.add(gi(get<2>(e)), get<3>(e));
            } else {
                long long best = bit.qry(gi(get<2>(e)));
                if (best > -4e18) {
                    int idx = get<3>(e);
                    ans[idx] = min(ans[idx], (int)(F[idx].first * sx +
                                                   F[idx].second * sy - best));
                }
            }
        }
    }
    for (int i = 0; i < m; i++) cout << ans[i] << ' ';
    cout << '\n';
}
```

:::

### Advertisement


**题目大意**：围栏由 `n` 块宽为 1、高度为 $k_i$ 的竖板组成（$n \le 2 \times 10^5$），求能贴下的最大矩形广告面积。

**解题思路**：最大矩形总可以取成“以某块板 `i` 的高度 $k_i$ 为高、向左右延伸到第一个更矮的板为止”：宽度为 $\text{next\_lower}[i]-\text{prev\_lower}[i]-1$，面积是它与 $k_i$ 之积。预处理两个边界数组：`prev_lower[i]` 是 `i` 左侧第一个高度严格小于 $k_i$ 的位置（没有则为 0），`next_lower[i]` 是右侧第一个这样的位置（没有则为 $n+1$）。两者都用“跳到已知边界”的方式递推：先令 `prev_lower[i] = i - 1`，只要 `prev_lower[i]` 处的板不小于 $k_i$，就令 `prev_lower[i] = prev_lower[prev_lower[i]]` 继续往左跳——被跳过的位置高度都不小于 $k_i$，不可能成为边界；`next_lower` 对称地从右往左求。最后对所有 `i` 取面积 $k_i\times(\text{next\_lower}[i]-\text{prev\_lower}[i]-1)$ 的最大值。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 200002;
int k[N];
int prev_lower[N], next_lower[N];
void solve() {
    int n;
    cin >> n;

    for (int i = 1; i <= n; ++i) {
        cin >> k[i];
    }

    for (int i = 1; i <= n; ++i) {
        prev_lower[i] = i - 1;
        while (prev_lower[i] >= 0 && k[prev_lower[i]] >= k[i]) {
            prev_lower[i] = prev_lower[prev_lower[i]];
        }
    }

    for (int i = n; i >= 1; --i) {
        next_lower[i] = i + 1;
        while (next_lower[i] <= n && k[next_lower[i]] >= k[i]) {
            next_lower[i] = next_lower[next_lower[i]];
        }
    }

    ll ans = 0;
    for (int i = 1; i <= n; ++i) {
        ans = max(ans, 1ll * (next_lower[i] - prev_lower[i] - 1) * k[i]);
    }

    cout << ans << '\n';
}
```

:::

### Special Substrings


**题目大意**：给定长度为 $n$（$n \le 2 \times 10^5$）的小写字母串，统计“特殊子串”的个数：若子串中每个在整串里出现过的字符，在该子串中的出现次数都相同，则该子串特殊。（例如 `abccabab` 的特殊子串是 `abc`、`cab`、`abccab`、`bccaba`、`ccabab`，共 5 个。）

**解题思路**：

- **观察**：取 `reference_char = s[0]` 作参考字符，维护前缀的“平衡向量” `cur`（26 维）。扫描到参考字符时，把 `seen` 中出现过的字符计数各减 1，再把当前字符计数加 1（因此参考字符那一维恒为 0）；扫描到其它字符 `c` 时同样把 `cur[c]` 加 1。这样 `cur[c]` 恒等于“前缀中 `c` 的出现次数减去参考字符的出现次数”。于是子串 $s_{l+1..r}$ 特殊当且仅当两个端点处的前缀向量相同：两向量相减得到的正是“子串中各字符次数减去参考字符次数”，全为 0 恰好表示每个出现过的字符次数都相等。

- **做法**：用 `map` 把向量映射到它此前出现过的次数（空前缀的零向量记 1 次），从左到右扫描 `s` 并更新 `cur`；每次先 `ans += m[cur]` 再 `m[cur]++`，因为相同向量的每一对位置（先出现的更小）恰好对应一个特殊子串。

- **边界**：只有 `seen` 中真正出现过的字符参与减 1，未出现的字符分量恒为 0，不影响判等；单字符子串只有在整串只含一种字符时才被计入，这正是向量相等判定的结果。时间复杂度为 $O(26n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
using A = array<int, 26>;
void solve() {
    string s;
    cin >> s;

    bool seen[26]{};
    char reference_char = s[0];

    for (char c : s) seen[c - 'a'] = true;

    map<A, int> m;
    A cur{};
    m[cur] = 1;
    ll ans = 0;

    for (char c : s) {
        if (c == reference_char) {
            for (int i = 0; i < 26; ++i) {
                if (seen[i])
                    cur[i]--;
            }
        }
        cur[c - 'a']++;
        ans += m[cur];
        m[cur]++;
    }

    cout << ans << '\n';
}
```

:::

### Counting LCM Arrays


**题目大意**：`t` 组询问，每组给出 `n` 与 `k`（$2 \le n \le 10^9$，$1 \le k \le 10^9$），统计长度为 `n` 的正整数数组个数，使任意相邻两项的最小公倍数都等于 `k`，答案对 $10^9+7$ 取模。

**解题思路**：

- **观察**：$\operatorname{lcm}(a_i,a_{i+1})=k$ 说明每个 $a_i$ 都是 `k` 的约数。把 `k` 写成 $\prod p^{e_p}$，每个 $a_i$ 就对应一组指数 $v_{i,p}\in[0,e_p]$，而条件按素因子独立：对每个 $p$ 都要求 $\max(v_{i,p},v_{i+1,p})=e_p$。因此总数等于各素因子贡献数的乘积。

- **做法**：对单个 $p^{e}$，只需数“长度为 `n`、相邻两项最大值恰为 $e$”的指数序列个数。构造 $(e+1)\times(e+1)$ 的转移矩阵 `T`，$T[x][y]=1$ 当且仅当 $\max(x,y)=e$，则合法序列数为 $T^{n-1}$ 的全部元素之和（记作 `S(e, n)`，用矩阵快速幂计算）。把 `k` 试除分解，每得到一个 $p^e$ 就把 `S(e, n)` 乘进答案；分解结束后若还剩下 $k>1$，它必是出现一次的素因子，按 `S(1, n)` 计入。

- **正确性**：$T^{n-1}[x][y]$ 正是“首项指数为 $x$、末项为 $y$，且每对相邻项最大值都为 $e$”的序列数，按 $x,y$ 求和即得全部合法序列；各素因子之间相互独立，再用乘法原理合并。

- **边界**：$k=1$ 时没有素因子，乘积为空，答案为 1（数组只能全是 1）。约束保证 $n\ge2$，于是 $T^{n-1}$ 至少乘过一次，得到的正是长度为 `n` 的序列数（若 $n=1$，正确结果是 1，而 $T^0$ 求和会得到 $e+1$，两者不同）。总时间复杂度为 $O(\sqrt{k}+\sum_{p}e_p^3\log n)$，空间复杂度为 $O(e_{\max}^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
struct Mat {
    int n;
    vector<vector<ll>> a;
    Mat(int n) : n(n), a(n, vector<ll>(n, 0)) {}
    Mat operator*(const Mat& o) const {
        Mat r(n);
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++)
                if (a[i][k])
                    for (int j = 0; j < n; j++)
                        r.a[i][j] = (r.a[i][j] + a[i][k] * o.a[k][j]) % MOD;
        return r;
    }
};
Mat pw(Mat b, ll e) {
    int n = b.n;
    Mat r(n);
    for (int i = 0; i < n; i++) r.a[i][i] = 1;
    while (e) {
        if (e & 1)
            r = r * b;
        b = b * b;
        e >>= 1;
    }
    return r;
}
ll S(int e, ll len) {
    int n = e + 1;
    Mat T(n);
    for (int x = 0; x <= e; x++)
        for (int y = 0; y <= e; y++)
            if (max(x, y) == e)
                T.a[x][y] = 1;
    Mat P = pw(T, len - 1);
    ll s = 0;
    for (int x = 0; x <= e; x++)
        for (int y = 0; y <= e; y++) s = (s + P.a[x][y]) % MOD;
    return s;
}
void solve() {
    int t;
    cin >> t;
    while (t--) {
        ll n, k;
        cin >> n >> k;
        ll ans = 1;
        for (ll p = 2; p * p <= k; p++) {
            if (k % p == 0) {
                int e = 0;
                while (k % p == 0) {
                    k /= p;
                    e++;
                }
                ans = ans * S(e, n) % MOD;
            }
        }
        if (k > 1)
            ans = ans * S(1, n) % MOD;
        cout << ans << '\n';
    }
}
```

:::

### Square Subsets


**题目大意**：给定 $n$ 个数（$n \le 5000$，$1 \le x_i \le 5000$），统计乘积为完全平方数的子集个数（空子集也计入，其乘积视为 1），答案对 $10^9+7$ 取模。

**解题思路**：

- **观察**：一个数是否为完全平方数只取决于它各素因子指数的奇偶性。对 $5000$ 以内的每个素数（共 $\pi(5000)=669$ 个）记录 $x_i$ 中该素数指数的奇偶，得到一个 $\mathrm{GF}(2)$ 上的位向量（用 `bitset<700>` 存）。若干个数的乘积为完全平方数，当且仅当这些位向量的异或和为 0。

- **做法**：把这 `n` 个位向量作为矩阵的行做高斯消元求秩 `rank`：逐列寻找主元行，与当前的 `rank` 行交换，再把这一列其余所有为 1 的行异或掉（`r != rank`，不动主元行本身）。自由变量个数为 $n-\text{rank}$，每个自由变量可取 0 或 1，故答案为 $2^{n-\text{rank}}$。

- **正确性**：异或和为 0 的解构成 $\mathrm{GF}(2)$ 上的线性子空间，其大小恰为 2 的自由变量个数次幂；每个解恰好对应一个乘积为完全平方数的子集。

- **边界**：$x_i=1$ 对应的行是零向量，会被当成自由变量，正好把“选它”与“不选它”都计入；消元只需要 669 位，取 700 位的 `bitset` 即可。总时间复杂度为 $O\!\left(n\cdot\frac{\pi(5000)^2}{64}\right)$，空间复杂度为 $O(n\cdot 700/8)$ 字节。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    const int LIM = 5000;
    vector<int> primes;
    vector<bool> comp(LIM + 1, false);
    for (int i = 2; i <= LIM; i++)
        if (!comp[i]) {
            primes.push_back(i);
            for (ll j = 1LL * i * i; j <= LIM; j += i) comp[j] = true;
        }
    int n;
    cin >> n;
    vector<bitset<700>> rows;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        bitset<700> b;
        for (int p = 0; p < (int)primes.size(); p++) {
            int c = 0;
            while (x % primes[p] == 0) {
                x /= primes[p];
                c++;
            }
            if (c % 2)
                b.set(p);
        }
        rows.push_back(b);
    }
    int rank = 0;
    for (int col = 0; col < (int)primes.size() && rank < n; col++) {
        int piv = -1;
        for (int r = rank; r < n; r++)
            if (rows[r].test(col)) {
                piv = r;
                break;
            }
        if (piv == -1)
            continue;
        swap(rows[rank], rows[piv]);
        for (int r = 0; r < n; r++)
            if (r != rank && rows[r].test(col))
                rows[r] ^= rows[rank];
        rank++;
    }
    ll ans = 1;
    for (int i = 0; i < n - rank; i++) ans = ans * 2 % MOD;
    cout << ans << '\n';
}
```

:::

### Subarray Sum Constraints


**题目大意**：给定 `n` 和 `m` 条约束，第 `i` 条约束给出 `l`、`r`、`s`，要求构造的数组满足 $x_l+x_{l+1}+\cdots+x_r=s$（元素可以取任意整数）。有解时第一行输出 `YES`、第二行输出这个数组；无解时输出 `NO`。

**解题思路**：

- **转化**：记前缀和 $S[0]=0$、$S[i]=x_1+\cdots+x_i$，每条约束就变成 $S[r]-S[l-1]=s$，即两个前缀之间的相对差是已知的。

- **做法**：用带权并查集维护前缀之间的相对差，`pot[x] = S[find(x)] - S[x]`（代表元的前缀和减去自身的前缀和），`find` 递归压缩时执行 `pot[x] += pot[par[x]]` 把差值逐级累加。读入约束 $(a,b,s)$（$a=l-1$、$b=r$）时：若 `a`、`b` 已在同一集合，就检查 `pot[a] - pot[b] == s`（同根时该差正好是 $S[b]-S[a]$），不成立即为矛盾、输出 `NO`；否则把两个根连起来，令 `par[ra] = rb` 并置 `pot[ra] = s + pot[b] - pot[a]`，这就是由 $S[b]-S[a]=s$ 推出的 $S[rb]-S[ra]$。

- **输出**：全部约束相容时，先对每个位置调用一次 `find` 把 `pot` 压成相对根的值，再按 `x[i] = pot[i-1] - pot[i]` 输出。这样构造出的数组前缀和 $S'[i]$ 与 `pot` 只相差同一个常数，而每条约束的两端在同一集合内且满足 `pot[a] - pot[b] == s`，所以 $S'[b]-S'[a]=s$ 自动成立。

- **边界**：即使已经判定矛盾，输入循环仍要把剩下的约束读完；`pot`、`s` 与输出的数都要用 64 位整数（$s$ 可达 $10^9$，链上累加会超出 32 位）。总时间复杂度为 $O((n+m)\alpha)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<int> par(n + 1), sz(n + 1, 1);
    vector<ll> pot(n + 1, 0);
    iota(par.begin(), par.end(), 0);
    function<int(int)> find = [&](int x) {
        if (par[x] == x)
            return x;
        int r = find(par[x]);
        pot[x] += pot[par[x]];
        return par[x] = r;
    };
    bool ok = true;
    for (int i = 0; i < m; i++) {
        int l, r;
        ll s;
        cin >> l >> r >> s;
        if (!ok)
            continue;
        int a = l - 1, b = r;
        int ra = find(a), rb = find(b);
        if (ra == rb) {
            if (pot[a] - pot[b] != s)
                ok = false;
        } else {
            par[ra] = rb;
            pot[ra] = s + pot[b] - pot[a];
        }
    }
    if (!ok) {
        cout << "NO\n";
        return;
    }
    cout << "YES\n";
    for (int i = 1; i <= n; i++) {
        find(i - 1), find(i);
        ll x = pot[i - 1] - pot[i];
        cout << x << ' ';
    }
    cout << '\n';
}
```

:::

### Water Containers Moves


**题目大意**：两个水壶容量分别为 `a`、`b`（$1 \le a,b,x \le 1000$），初始都是空的。每次操作可以：装满 A、装满 B、倒空 A、倒空 B、把 A 倒进 B、把 B 倒进 A；一次操作的代价是这次移动的水量（每条操作至少要移动 1 单位水）。要求最终 A 壶中有恰好 `x` 单位水，求总代价最小的操作序列：先输出操作条数与总移动水量，再逐行输出操作名（`FILL A`、`FILL B`、`EMPTY A`、`EMPTY B`、`MOVE A B`、`MOVE B A`），无解输出 `-1`。

**解题思路**：

- **做法**：把“两壶当前水量” `(ca, cb)`（$0\le ca\le a$、$0\le cb\le b$）看成图的节点，六种操作各是一条边，边权为该操作移动的水量：装满 A 的代价 $a-ca$、装满 B 的代价 $b-cb$、倒空 A 的代价 $ca$、倒空 B 的代价 $cb$、A 倒进 B 的代价 $\min(ca,\,b-cb)$、B 倒进 A 的代价 $\min(cb,\,a-ca)$。以 `(0,0)` 为源跑 Dijkstra，`dist` 记录最短路、`pre` 记录前驱状态与操作名；第一次从优先队列取出满足 $ca=x$ 的状态时，它的距离就是最小总代价，沿 `pre` 回溯并把操作序列翻转即得答案。

- **正确性**：状态数有限、边权非负，Dijkstra 首次弹出目标状态时的距离一定是到该状态的最小总代价；任何操作序列都对应图中一条路径，故最优路径与最小代价序列一一对应。

- **边界**：移动量为 0 的操作（例如 A 已满时再装满 A）只是同状态自环，`dist` 不会变优因而不会被记录，输出序列里每条操作都确实移动了水；若优先队列耗尽仍未出现 $ca=x$ 的状态（只在 $x>a$ 时可能），输出 `-1`。总时间复杂度为 $O(ab\log(ab))$，空间复杂度为 $O(ab)$。

:::details[题解(C++)]

```c++
void solve() {
    int a, b, x;
    cin >> a >> b >> x;

    const int BIG = 1e9;
    vector<vector<int>> dist(a + 1, vector<int>(b + 1, BIG));
    vector<vector<pair<pair<int, int>, string>>> pre(
        a + 1, vector<pair<pair<int, int>, string>>(b + 1));
    priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>,
                   greater<tuple<int, int, int>>>
        pq;
    dist[0][0] = 0;
    pq.push({0, 0, 0});
    bool found = false;
    while (!pq.empty()) {
        auto [d, ca, cb] = pq.top();
        pq.pop();
        if (d > dist[ca][cb])
            continue;
        if (ca == x) {
            vector<string> moves;
            int ta = ca, tb = cb;
            while (!(ta == 0 && tb == 0)) {
                moves.push_back(pre[ta][tb].second);
                int pa = pre[ta][tb].first.first, pb = pre[ta][tb].first.second;
                ta = pa;
                tb = pb;
            }
            reverse(moves.begin(), moves.end());
            cout << moves.size() << ' ' << d << '\n';
            for (auto& s : moves) cout << s << '\n';
            found = true;
            break;
        }
        auto relax = [&](int na, int nb, int cost, const string& op) {
            if (dist[na][nb] > d + cost) {
                dist[na][nb] = d + cost;
                pre[na][nb] = {{ca, cb}, op};
                pq.push({dist[na][nb], na, nb});
            }
        };
        relax(a, cb, a - ca, "FILL A");
        relax(ca, b, b - cb, "FILL B");
        relax(0, cb, ca, "EMPTY A");
        relax(ca, 0, cb, "EMPTY B");
        int am = min(ca, b - cb);
        relax(ca - am, cb + am, am, "MOVE A B");
        int bm = min(cb, a - ca);
        relax(ca + bm, cb - bm, bm, "MOVE B A");
    }
    if (!found)
        cout << -1 << '\n';
}
```

:::

### Water Containers Queries


**题目大意**：`t` 组询问，每组给出两个水壶的容量 `a`、`b` 和目标量 `x`，判断能否通过装满、倒空、互相倒水让 A 壶中恰好有 `x` 单位水：可以则输出 `YES`，否则输出 `NO`。

**解题思路**：

- **观察**：设 $g=\gcd(a,b)$。两壶的水量在任何时刻都形如 $u\cdot a+v\cdot b$（$u,v$ 为整数），因此必是 `g` 的倍数；又因为最终 `x` 要装在 A 壶里，必然 $x\le a$。反过来这两条也是充分的：由 Bézout 等式 $ua+vb=g$，“反复装满一个壶、倒进另一个，满了就倒空”的过程能倒出 `g` 的每个不超过 $a$ 的倍数，它们都可以停在 A 壶中。

- **判据**：`x % gcd(a, b) == 0 && x <= a`。只写 `x <= max(a, b)` 会漏掉 A 壶容量这一约束：当 $a<x\le b$ 且 $g\mid x$ 时（例如 $a=2,b=4,x=4$）A 壶根本装不下，应判 `NO`。

- **边界**：判据里的上界是 A 壶容量 $a$，不是 $max(a,b)$；$a=b$ 时 $g=a$，判据给出只有 $x=a$（装满 A）可行，与实际一致。每组时间复杂度为 $O(\log\min(a,b))$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int t;
    cin >> t;
    while (t--) {
        ll a, b, x;
        cin >> a >> b >> x;
        ll g = gcd(a, b);
        if (x % g == 0 && x <= a)
            cout << "YES\n";
        else
            cout << "NO\n";
    }
}
```

:::

### Stack Weights


**题目大意**：有 `n` 枚硬币（$n \le 2 \times 10^5$），编号 $1..n$、重量两两不同且编号越大越重，但具体重量未知。两堆初始为空，依次执行 `n` 次操作：每次把硬币 `c` 放到第 `s` 堆（1 = 左堆，2 = 右堆）。每次操作后判断哪一堆更重——若在所有满足 $w_1<w_2<\cdots<w_n$ 的重量取值下都确定，则输出 `>`（左堆更重）或 `<`（右堆更重），否则输出 `?`。

**解题思路**：

- **观察**：给左堆硬币记 $s_i=+1$、右堆记 $-1$，两堆重量差为 $D=\sum_i s_i w_i$。对它做分部求和可得

$$D=\sum_{k=1}^{n}P_k\,(w_k-w_{k-1}),\qquad w_0=0,\qquad P_k=s_k+s_{k+1}+\cdots+s_n .$$

- **判据**：相邻重量差 $w_k-w_{k-1}$ 可以取任意正数，所以：存在某个 $P_k<0$ 时，把对应的差取得足够大就能让 $D<0$；存在某个 $P_j>0$ 时同理能让 $D>0$。两者同时存在则正负都可能，输出 `?`；若所有 $P_k\ge0$，由于 $P_n=s_n=\pm1$ 恒不为 0，必有某个 $P_k>0$，此时 $D>0$ 恒成立，输出 `>`；所有 $P_k\le0$ 时对称地输出 `<`。

- **做法**：把硬币 `c` 放进第 1 堆或第 2 堆，等价于把 $s_c$ 设为 $\pm1$，而这只影响后缀和 $P_1,\dots,P_c$（每个都加 $\pm1$），在代码里就是区间 `[0, c-1]` 的区间加（代码的下标 `k` 对应 $P_{k+1}$）。用带懒标记的线段树维护这个数组的最小值与最大值：每次操作后若全局最小值 $a\ge0$ 输出 `>`，若全局最大值 $b\le0$ 输出 `<`，否则输出 `?`。

- **边界**：初始时所有后缀和都是 0；查询区间覆盖 $P_1..P_n$（即代码下标 `0..n-1`）。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef pair<int, int> PII;
const int N = 2e5 + 7;
int n, h;
PII t[2 * N];
int d[N];
void apply(int p, int value) {
    t[p].first += value;
    t[p].second += value;
    if (p < n)
        d[p] += value;
}
void build(int p) {
    while (p > 1) {
        p >>= 1;
        t[p].first = min(t[p << 1].first, t[p << 1 | 1].first) + d[p];
        t[p].second = max(t[p << 1].second, t[p << 1 | 1].second) + d[p];
    }
}
void push(int p) {
    for (int s = h; s > 0; --s) {
        int i = p >> s;
        if (d[i] != 0) {
            apply(i << 1, d[i]);
            apply(i << 1 | 1, d[i]);
            d[i] = 0;
        }
    }
}
void inc(int l, int r, int value) {
    l += n, r += n;
    int l0 = l, r0 = r;
    for (; l < r; l >>= 1, r >>= 1) {
        if (l & 1)
            apply(l++, value);
        if (r & 1)
            apply(--r, value);
    }
    build(l0);
    build(r0 - 1);
}
int query_min(int l, int r) {
    l += n, r += n;
    push(l);
    push(r - 1);
    int res = 2e9;
    for (; l < r; l >>= 1, r >>= 1) {
        if (l & 1)
            res = min(res, t[l++].first);
        if (r & 1)
            res = min(t[--r].first, res);
    }
    return res;
}
int query_max(int l, int r) {
    l += n, r += n;
    push(l);
    push(r - 1);
    int res = -2e9;
    for (; l < r; l >>= 1, r >>= 1) {
        if (l & 1)
            res = max(res, t[l++].second);
        if (r & 1)
            res = max(t[--r].second, res);
    }
    return res;
}
void solve() {
    cin >> n;
    h = sizeof(int) * 8 - __builtin_clz(n);
    for (int i = 1; i <= n; i++) {
        int x, opt;
        cin >> x >> opt;
        if (opt == 1)
            inc(0, x, 1);
        else
            inc(0, x, -1);
        int a = query_min(0, n);
        int b = query_max(0, n);
        if (a >= 0) {
            cout << '>' << '\n';
            continue;
        }
        if (b <= 0) {
            cout << '<' << '\n';
            continue;
        }
        cout << '?' << '\n';
    }
}
```

:::

### Maximum Average Subarrays


**题目大意**：给定长度为 $n$ 的数组（$n \le 2 \times 10^5$），对每个下标 `i`（1 起）求“以 `i` 结尾、平均值最大”的子数组的最大长度（平均值相同则取最长），依次输出这 `n` 个长度。

**解题思路**：

- **观察**：子数组 $[l+1,i]$ 的平均值就是前缀和点 $(l,\text{pref}[l])$ 到 $(i,\text{pref}[i])$ 的斜率，于是对每个 `i` 要在所有起点 $l<i$ 中找斜率最大的点。候选起点只需保留“下凸”的部分：上凸的点不可能成为任何查询点的斜率最大值，因此用单调栈式的方法维护下凸包——加入 `j-1` 之前，若包顶两个点与它的叉积 $\ge0$（不再严格下凸）就弹掉包顶。

- **做法**：对每个 `i` 在凸包上二分找斜率最大的点：包上各点到固定点的斜率是先增后减的单峰序列，比较相邻两点斜率即可决定往哪边收。比较写作 `if (s2 > s1 + 1e-18) lo = mid + 1; else hi = mid;`，让相同的最大值停在更靠左（起点更小）的位置，从而在平均值相同时取到最长子数组，输出 `j - hull[lo]`。

- **正确性**：下凸包不会丢掉任何可能的斜率最大值（上凸点被相邻两点连线支配）；斜率单峰保证二分能定位最大值，向左收缩保证同值时取最长。

- **边界**：叉积用 64 位整数计算（前缀和不超过 $2\times10^{11}$，与下标相乘后仍在 64 位范围内）；斜率比较用 `long double` 并加 $10^{-18}$ 的容差。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n), pref(n + 1, 0);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        pref[i + 1] = pref[i] + a[i];
    }
    vector<int> hull;
    auto cross = [&](int o, int p, int q) {
        return (pref[p] - pref[o]) * (q - o) - (pref[q] - pref[o]) * (p - o);
    };
    hull.push_back(0);
    for (int j = 1; j <= n; j++) {
        int p = j - 1;
        while (hull.size() >= 2 &&
               cross(hull[hull.size() - 2], hull.back(), p) >= 0)
            hull.pop_back();
        hull.push_back(p);
        int lo = 0, hi = hull.size() - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            long double s1 =
                (long double)(pref[j] - pref[hull[mid]]) / (j - hull[mid]);
            long double s2 = (long double)(pref[j] - pref[hull[mid + 1]]) /
                             (j - hull[mid + 1]);
            if (s2 > s1 + 1e-18)
                lo = mid + 1;
            else
                hi = mid;
        }
        cout << j - hull[lo] << ' ';
    }
    cout << '\n';
}
```

:::

### Subsets with Fixed Average


**题目大意**：给定 $n$ 个数（$n \le 500$，$1 \le a,x_i \le 500$）与目标平均值 `a`，统计平均值恰好为 `a` 的**非空**子集个数，对 $10^9+7$ 取模。

**解题思路**：子集平均值为 `a` 当且仅当 $\sum_i (x_i-a)=0$，故令 `d[i] = x[i] - a`，问题化为统计和为 0 的子集个数（0/1 背包）。负数和用偏移表示：`off` 取所有负的 `d[i]` 的绝对值之和，`dp[s]` 记和为 $s-off$ 的子集数，初值 `dp[off] = 1`。转移按符号分三种：`d[i] > 0` 时倒序枚举 `s`（保证每个元素只用一次）；`d[i] < 0` 时正序枚举（等价于向负方向做背包）；`d[i] == 0` 时该元素可以与任意子集自由组合，把所有状态乘 2。答案为 `dp[off] - 1`（去掉空集）。时间复杂度为 $O(n\sum_i|d_i|)$，空间复杂度为 $O(\sum_i|d_i|)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n, a;
    cin >> n >> a;
    vector<int> d(n);
    int neg = 0, pos = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        d[i] = x - a;
        if (d[i] < 0)
            neg += -d[i];
        else
            pos += d[i];
    }
    vector<ll> dp(neg + pos + 1, 0);
    int off = neg;
    dp[off] = 1;
    for (int v : d) {
        if (v > 0) {
            for (int s = neg + pos; s >= v; s--)
                dp[s] = (dp[s] + dp[s - v]) % MOD;
        } else if (v < 0) {
            for (int s = 0; s <= neg + pos + v; s++)
                dp[s] = (dp[s] + dp[s - v]) % MOD;
        } else {
            for (int s = 0; s <= neg + pos; s++) dp[s] = dp[s] * 2 % MOD;
        }
    }
    cout << (dp[off] - 1 + MOD) % MOD << '\n';
}
```

:::

### Two Array Average


**题目大意**：给定两个长度为 `n` 的数组（$n \le 10^5$，$1 \le a_i,b_i \le 10^9$），各选一个非空前缀，把两段数拼在一起，求能达到的最大平均值，并输出两个前缀的长度。

**解题思路**：

- **观察**：二分答案 `m`。存在前缀长度 `i`、`j` 使 $\frac{pa[i]+pb[j]}{i+j}\ge m$，等价于 $(pa[i]-m\cdot i)+(pb[j]-m\cdot j)\ge0$，也就是说两个数组可以各自独立地取 $pa[i]-m\cdot i$ 的最大值（记作 $A(m)$、$B(m)$）再相加判断。又因为 $i\ge1$ 时 $pa[i]-m\cdot i$ 关于 `m` 单调不增，$A(m)+B(m)$ 关于 `m` 也单调不增，判定具有单调性，可以二分。

- **做法**：在 $[0,10^{18}]$ 上二分 200 次（用 `long double` 保证精度），每次 `check` 扫描两个数组求出 $A(m)$、$B(m)$ 以及取到最大值的下标，判定成功时把这两个下标记为答案。判定成功的最大 `m` 可以任意接近最优平均值，因此记录下来的前缀平均值与之相差不超过精度，满足 $10^{-6}$ 的相对或绝对误差要求。

- **边界**：前缀必须非空，扫描从下标 1 开始；初值取 $-10^{30}$ 保证所有 $pa[i]-m\cdot i$ 为负时也能取到最大值与对应下标。总时间复杂度为 $O(n\log\frac{1}{\epsilon})$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n + 1), b(n + 1), pa(n + 1, 0), pb(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        pa[i] = pa[i - 1] + a[i];
    }
    for (int i = 1; i <= n; i++) {
        cin >> b[i];
        pb[i] = pb[i - 1] + b[i];
    }
    auto check = [&](long double m, int& ia, int& ib) {
        long double bestA = -1e30, bestB = -1e30;
        int bi = 1, bj = 1;
        for (int i = 1; i <= n; i++) {
            long double v = pa[i] - m * i;
            if (v > bestA) {
                bestA = v;
                bi = i;
            }
        }
        for (int j = 1; j <= n; j++) {
            long double v = pb[j] - m * j;
            if (v > bestB) {
                bestB = v;
                bj = j;
            }
        }
        if (bestA + bestB >= 0) {
            ia = bi;
            ib = bj;
            return true;
        }
        return false;
    };
    long double lo = 0, hi = 1e18;
    int ia = 1, ib = 1;
    for (int it = 0; it < 200; it++) {
        long double mid = (lo + hi) / 2;
        int ca, cb;
        if (check(mid, ca, cb)) {
            lo = mid;
            ia = ca;
            ib = cb;
        } else
            hi = mid;
    }
    cout << ia << ' ' << ib << '\n';
}
```

:::

### Pyramid Array


**题目大意**：给定 $n$ 个互不相同的数（$n \le 2 \times 10^5$），每次操作可以交换相邻两个元素，求把它变成“先增后减”（允许只增或只减）的数组所需的最少交换次数。

**解题思路**：按值从小到大处理每个元素。当前最小的元素在最终的金字塔里必然位于左端或右端：把它移到左端需要越过它左边所有还没处理过的元素（代价 = 左侧剩余元素个数），移到右端同理（代价 = 右侧剩余元素个数），取较小者累加，然后把它从序列中删去。实现用树状数组维护“位置是否还有剩余元素”：处理元素时 `left = qry(pos - 1)` 就是左侧剩余个数，`right = remaining - left - 1`，累加 $\min(\text{left},\text{right})$ 后把该位置置 0。任何合法方案中，当前最小元素都必须越过它一侧的全部剩余元素，故这个下界可以被贪心取到，方案最优。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<pair<ll, int>> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i].first;
        v[i].second = i;
    }
    sort(v.begin(), v.end());
    vector<int> bit(n + 2, 0);
    auto add = [&](int i, int d) {
        for (; i <= n; i += i & -i) bit[i] += d;
    };
    auto qry = [&](int i) {
        int s = 0;
        for (; i > 0; i -= i & -i) s += bit[i];
        return s;
    };
    for (int i = 1; i <= n; i++) add(i, 1);
    int remaining = n;
    ll ans = 0;
    for (int i = 0; i < n; i++) {
        int pos = v[i].second + 1;
        int left = qry(pos - 1);
        ans += min(left, remaining - left - 1);
        add(pos, -1);
        remaining--;
    }
    cout << ans << '\n';
}
```

:::

### Permutation Subsequence


**题目大意**：给定两个排列，长度分别为 `n`、`m`（$n,m \le 2 \times 10^5$），求它们的最长公共子序列：先输出长度，再输出一个这样的子序列（输出取值本身，不是下标）。

**解题思路**：排列上的 LCS 可以转成 LIS。先用 `posA` 记录排列 `a` 中每个值出现的位置；再把 `b` 中出现在 `a` 里的值按 `posA` 的值依次取出，得到序列 `seq`（每项是“该值在 `a` 中的位置”与值本身）。公共子序列在 `a`、`b` 中的位置都必须递增，而 `b` 中的次序已由 `seq` 的顺序固定，所以公共子序列与 `seq` 的上升子序列一一对应。对 `seq` 的第一个分量求 LIS：`d` 数组配合 `lower_bound` 维护“长度为 $k$ 的上升子序列的最小结尾值”，同时用 `prevId` 记录每个元素入 `d` 时的前驱编号、用 `idOf` 记录 `d` 每个位置当前对应的 `seq` 下标，最后从 `idOf` 末尾回溯即可还原实际取值。`b` 中可能含有大于 `n` 的值（它不可能出现在 `a` 里），必须跳过这类值。时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<int> posA(n + 1, -1);
    for (int i = 1; i <= n; i++) {
        int v;
        cin >> v;
        posA[v] = i;
    }
    vector<pair<int, int>> seq;
    for (int i = 0; i < m; i++) {
        int v;
        cin >> v;
        if (v <= n && posA[v] != -1)
            seq.push_back({posA[v], v});
    }
    vector<int> d;
    vector<int> prevId(seq.size(), -1);
    vector<int> idOf;
    for (int i = 0; i < (int)seq.size(); i++) {
        int p = seq[i].first;
        auto it = lower_bound(d.begin(), d.end(), p);
        int idx = it - d.begin();
        if (it == d.end()) {
            d.push_back(p);
            idOf.push_back(i);
        } else {
            *it = p;
            idOf[idx] = i;
        }
        if (idx > 0)
            prevId[i] = idOf[idx - 1];
    }
    cout << d.size() << '\n';
    if (!d.empty()) {
        vector<int> out;
        int cur = idOf.back();
        while (cur != -1) {
            out.push_back(seq[cur].second);
            cur = prevId[cur];
        }
        reverse(out.begin(), out.end());
        for (int v : out) cout << v << ' ';
        cout << '\n';
    }
}
```

:::

### Bit Inversions


**题目大意**：给定一个 01 串（$n \le 2 \times 10^5$）和 `q` 次修改（$q \le 2 \times 10^5$），每次修改翻转一个指定位置，输出修改后串中最长的“每一位都相同”的子串长度。

**解题思路**：为 0 和 1 各开一棵维护“最长连续段”的线段树（`val` 是区间内有效位置的个数，`pre`、`suf` 是区间两端连续有效段的长度，`t` 是区间内最长连续有效段长度；合并时 `t` 取三者最大：`t左`、`t右`、`suf左 + pre右`）。建树时第 `i` 位是 0 就在 0 的树里把位置 `i` 置 1、在 1 的树里置极小值（禁用），反之对称；`f(p, x)` 把叶子置为 `x` 并向上更新，其中 `pre`、`suf`、`t` 都取 `max(0, x)`，所以被禁用的叶子贡献 0。翻转位置 `x` 时把两棵树的对应叶子互换（当前是 0 就把 1 的树置 1、0 的树置极小值），答案即 `max(0 树根.t, 1 树根.t)`。位置按 1 起编号，两棵树的叶子下标与它一致。总时间复杂度为 $O((n+q)\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;
int n, m;
struct segtree {
    ll t[2 * N], pre[2 * N], suf[2 * N], val[2 * N];
    void f(ll p, ll x) {
        p += N;
        val[p] = x;
        pre[p] = suf[p] = t[p] = max(0ll, x);
        for (p >>= 1; p; p >>= 1) {
            val[p] = val[p << 1] + val[p << 1 | 1];
            pre[p] = max(pre[p << 1], val[p << 1] + pre[p << 1 | 1]);
            suf[p] = max(suf[p << 1] + val[p << 1 | 1], suf[p << 1 | 1]);
            t[p] = max(t[p << 1], t[p << 1 | 1]);
            t[p] = max(t[p], suf[p << 1] + pre[p << 1 | 1]);
        }
    }
} S, T;
string s;
void solve() {
    cin >> s;
    int len = s.size();
    for (int i = 1; i <= len; i++) {
        if (s[i - 1] == '0') {
            S.f(i, 1);
            T.f(i, -INF);
        } else {
            T.f(i, 1);
            S.f(i, -INF);
        }
    }
    int q;
    cin >> q;
    while (q--) {
        int x;
        cin >> x;
        if (s[x - 1] == '0') {
            s[x - 1] = '1';
            T.f(x, 1);
            S.f(x, -INF);
        } else {
            s[x - 1] = '0';
            S.f(x, 1);
            T.f(x, -INF);
        }
        cout << max(S.t[1], T.t[1]) << " ";
    }
}
```

:::

### Writing Numbers


**题目大意**：每个数字键 0..9 至多按下 `n` 次（$n \le 10^{18}$），从 1 开始依次写出自然数，求能写到的最大整数。

**解题思路**：二分答案 `N`，判定“写出 $1..N$ 是否每个数字键都用不超过 `n` 次”关于 `N` 单调，故可以二分最大的可行值（上界取 $4\times10^{18}$，用 `lo + (hi - lo + 1) / 2` 的写法取上中位数以避免死循环）。判定 `ok(N, n)` 按位统计：对每个数位 `p`（个位、十位……）和每个数字 `d`，先有 $\text{high}\cdot p$ 次出现，其中 `high = N/(p*10)`、`cur = (N/p)%10`、`low = N%p`；若 $d<\text{cur}$ 再加 $p$ 次，若 $d=\text{cur}$ 再加 $\text{low}+1$ 次；数字 0 还要减去 $p$ 次（最高位不能是 0，这些是不算按键的前导零）。一旦某个数字超限就判定失败。总时间复杂度为 $O(10\log^2 N)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
bool ok(ll N, ll n) {
    array<ll, 10> cnt{};
    for (ll p = 1; p <= N; p *= 10) {
        ll high = N / (p * 10), cur = (N / p) % 10, low = N % p;
        for (int d = 0; d < 10; d++) {
            ll c = high * p;
            if (d < cur)
                c += p;
            else if (d == cur)
                c += low + 1;
            if (d == 0)
                c -= p;
            cnt[d] += c;
            if (cnt[d] > n)
                return false;
        }
    }
    return true;
}
void solve() {
    ll n;
    cin >> n;
    ll lo = 1, hi = 4e18;
    while (lo < hi) {
        ll mid = lo + (hi - lo + 1) / 2;
        if (ok(mid, n))
            lo = mid;
        else
            hi = mid - 1;
    }
    cout << lo << '\n';
}
```

:::

### Letter Pair Move Game


**题目大意**：`2n` 个盒子排成一行（$n \le 100$），其中恰有两个相邻盒子为空（用 `.` 表示），其余盒子放着字母 A 或 B（两种字母各出现 $n-1$ 次）。每次操作可以选任意两个相邻的字母盒子，把它们（保持左右顺序）整体移到那两个相邻空盒中。要求最终所有 A 都排在所有 B 前面：先输出操作步数 `k`（$k \le 1000$），再依次输出每一步移动后的整行局面；无解输出 `-1`。

**解题思路**：

- **做法**：以整行字符串为状态做 BFS。每个状态里恰好有一对相邻空盒，先记下它的左端点 `gap`；再枚举所有由两个相邻非空字符组成的位置对，把它们按原顺序搬到 `gap`、`gap+1` 生成新状态。用 `unordered_map` 记录每个状态的前驱局面，它同时兼作访问标记。BFS 出队时判断当前局面是否已满足“不存在 B 出现在 A 之前”（`okf` 从左到右扫一遍即可），一旦满足就沿 `pre` 回溯出从初始局面到目标局面的每个中间局面（回溯得到的是每步移动之后的局面，正好是要求的输出），翻转顺序后输出。

- **正确性**：BFS 按步数分层扩展，第一次遇到的合法局面所对应的步数就是最少步数；题目保证有解时步数不超过 $10n\le1000$，满足输出上限。

- **边界**：初始局面可能已经合法，此时输出 0 步且不输出任何局面；为避免状态数膨胀，代码把出队次数限制在 $2\times10^6$ 次（实际搜索空间远小于该上限）。总时间复杂度为 $O(\text{可达状态数}\cdot n)$，空间复杂度为 $O(\text{可达状态数}\cdot n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    string s;
    cin >> n >> s;
    int N = 2 * n;
    unordered_map<string, pair<string, int>> pre;
    queue<string> q;
    q.push(s);
    pre[s] = {"", -1};
    bool found = false;
    int it = 0;
    while (!q.empty() && it++ < 2000000) {
        auto cur = q.front();
        q.pop();
        auto okf = [&]() {
            int seenB = 0;
            for (char c : cur) {
                if (c == 'B')
                    seenB = 1;
                if (c == 'A' && seenB)
                    return false;
            }
            return true;
        };
        if (okf()) {
            vector<string> moves;
            string t = cur;
            while (t != s) {
                moves.push_back(t);
                t = pre[t].first;
            }
            reverse(moves.begin(), moves.end());
            cout << moves.size() << '\n';
            for (auto& m : moves) cout << m << '\n';
            found = true;
            break;
        }
        int gap = -1;
        for (int i = 0; i + 1 < N; i++)
            if (cur[i] == '.' && cur[i + 1] == '.')
                gap = i;
        for (int i = 0; i + 1 < N; i++) {
            if (cur[i] != '.' && cur[i + 1] != '.') {
                string nxt = cur;
                nxt[gap] = cur[i];
                nxt[gap + 1] = cur[i + 1];
                nxt[i] = '.';
                nxt[i + 1] = '.';
                if (!pre.count(nxt)) {
                    pre[nxt] = {cur, 0};
                    q.push(nxt);
                }
            }
        }
    }
    if (!found)
        cout << -1 << '\n';
}
```

:::

### Maximum Building I


**题目大意**：给定 $n\times m$ 的森林地图（$n,m \le 1000$），`*` 表示有树、`.` 表示空地，求不含树的矩形建筑的最大面积。

**解题思路**：

- **做法**：按行扫描，把当前行当作矩形的底边。用 `a[j]` 记录第 `j` 列最近一次出现树的行号，则高度数组 `h[j] = i - a[j]` 就是第 `j` 列从第 `i` 行向上连续空地的个数（本行是树时 `h[j] = 0`）。用线段树维护这一行的 `h`（单点赋值、区间查最小值），每行开始时对每列执行一次 `modify`。

- **统计**：对每个 `j`，以 `h[j]` 为最矮列的最大矩形，左边界是 `j` 左边第一个高度严格小于 `h[j]` 的列再加一，右边界是右边第一个这样的列再减一。代码用 `get_last`、`get_first` 在区间内借助最小值二分找这两个位置：找不到时先把边界补成 1 或 `m`，再根据“边界列是否真的更矮”决定要不要再收一格，面积取 $h[j]\times(r-l+1)$。对所有行的所有列取最大值即为答案。

- **边界**：`get_last` 在 `[1, j-1]`、`get_first` 在 `[j+1, m]` 内查找，`j=1` 或 `j=m` 时区间为空并返回 `-1`；高度相等按“严格更矮”处理，相等列之间不会互相截断。总时间复杂度为 $O(nm\log m)$，空间复杂度为 $O(m)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
struct segment {
    int l;
    int r;
    int sum;
    int lazy_inc;
    int lazy_rev;
    int Max;
    int Min;
} tr[N << 2];
void increase(int rt, int v) {
    int l = tr[rt].l, r = tr[rt].r;
    tr[rt].sum += (r - l + 1) * v;
    tr[rt].Max += v;
    tr[rt].Min += v;
    tr[rt].lazy_inc += v;
}
void revise(int rt, int v) {
    int l = tr[rt].l, r = tr[rt].r;
    tr[rt].sum = (r - l + 1) * v;
    tr[rt].Max = v;
    tr[rt].Min = v;
    tr[rt].lazy_rev = v;
    tr[rt].lazy_inc = 0;
}
void pushdown(int rt) {
    if (tr[rt].lazy_rev) {
        revise(rt << 1, tr[rt].lazy_rev);
        revise(rt << 1 | 1, tr[rt].lazy_rev);
        tr[rt].lazy_rev = 0;
    }
    if (tr[rt].lazy_inc) {
        increase(rt << 1, tr[rt].lazy_inc);
        increase(rt << 1 | 1, tr[rt].lazy_inc);
        tr[rt].lazy_inc = 0;
    }
}
void pushup(int n) {
    tr[n].Max = max(tr[n << 1].Max, tr[n << 1 | 1].Max);
    tr[n].Min = min(tr[n << 1].Min, tr[n << 1 | 1].Min);
    tr[n].sum = tr[n << 1].sum + tr[n << 1 | 1].sum;
}
void build(int rt, int l, int r) {
    tr[rt].l = l;
    tr[rt].r = r;
    tr[rt].lazy_inc = 0;
    tr[rt].lazy_rev = 0;
    if (l == r) {
        tr[rt].Min = tr[rt].Max = tr[rt].sum = 0;
        return;
    }
    int mid = (l + r) >> 1;
    build(rt << 1, l, mid);
    build(rt << 1 | 1, mid + 1, r);
    pushup(rt);
}
void modify(int rt, int l, int r, int v) {
    if (l > tr[rt].r || tr[rt].l > r)
        return;
    if (l <= tr[rt].l && tr[rt].r <= r) {
        revise(rt, v);
        return;
    }
    pushdown(rt);
    modify(rt << 1, l, r, v);
    modify(rt << 1 | 1, l, r, v);
    pushup(rt);
}
void add(int rt, int l, int r, int v) {
    if (l > tr[rt].r || tr[rt].l > r)
        return;
    if (l <= tr[rt].l && tr[rt].r <= r) {
        increase(rt, v);
        return;
    }
    pushdown(rt);
    add(rt << 1, l, r, v);
    add(rt << 1 | 1, l, r, v);
    pushup(rt);
}
int get_first(int rt, int l, int r, int x) {
    int ls = tr[rt].l, rs = tr[rt].r;
    if (ls > r || rs < l)
        return -1;
    if (l <= ls && rs <= r) {
        if (tr[rt].Min >= x)
            return -1;
        while (ls != rs) {
            int mid = ls + (rs - ls) / 2;
            if (tr[rt << 1].Min < x) {
                rt = rt << 1;
                rs = mid;
            } else {
                rt = rt << 1 | 1;
                ls = mid + 1;
            }
        }
        return ls;
    }
    int res = get_first(rt << 1, l, r, x);
    if (res != -1)
        return res;
    return get_first(rt << 1 | 1, l, r, x);
}
int get_last(int rt, int l, int r, int x) {
    int ls = tr[rt].l, rs = tr[rt].r;
    if (ls > r || rs < l)
        return -1;
    if (l <= ls && rs <= r) {
        if (tr[rt].Min >= x)
            return -1;
        while (ls != rs) {
            int mid = ls + (rs - ls) / 2;
            if (tr[rt << 1 | 1].Min < x) {
                rt = rt << 1 | 1;
                ls = mid + 1;
            } else {
                rt = rt << 1;
                rs = mid;
            }
        }
        return ls;
    }
    int res = get_last(rt << 1 | 1, l, r, x);
    if (res != -1)
        return res;
    return get_last(rt << 1, l, r, x);
}
int n, m;
int a[N];
string s;
void solve() {
    cin >> n >> m;
    ll res = 0;
    build(1, 1, m);
    for (int i = 1; i <= n; i++) {
        cin >> s;
        for (int j = 1; j <= m; j++) {
            if (s[j - 1] == '*') {
                a[j] = i;
            }
        }
        for (int j = 1; j <= m; j++) modify(1, j, j, i - a[j]);
        ll ans = 0;
        for (int j = 1; j <= m; j++) {
            int l = get_last(1, 1, j - 1, i - a[j]);
            int r = get_first(1, j + 1, m, i - a[j]);
            if (l == -1)
                l = 1;
            if (r == -1)
                r = m;
            if (l != 1 || (i - a[l] < i - a[j]))
                l++;
            if (r != m || (i - a[r] < i - a[j]))
                r--;
            ans = max(ans, (ll)(r - l + 1) * (i - a[j]));
        }
        res = max(res, ans);
    }
    cout << res << '\n';
}
```

:::

### Sorting Methods


**题目大意**：给定 $1..n$ 的一个排列，分别用四种操作把它排成升序，输出各自的最少操作次数：① 每次交换相邻两个元素；② 每次交换任意两个元素；③ 每次取出任意一个元素插到任意位置；④ 每次取出任意一个元素放到数组最前面。

**解题思路**：四个经典结论。① 相邻交换：最少次数 = 逆序对数，实现时先把所有值插入有序集合，再依次扫描数组，删除当前值之前统计集合中小于它的元素个数（这些正是它后面比它小的元素），累加即为逆序对数。② 任意交换：最少次数 = $n-\text{置换环数}$，一次交换至多让环数增加 1，而沿环交换 $k-1$ 次就能修好环上的 $k$ 个位置。③ 插入到任意位置：最少次数 = $n-\text{LIS 长度}$，保留最长上升子序列不动、其余元素依次插到正确位置即可达到，且任何方案都至少要让这么多元素移动。④ 放到最前：最少次数 = $n-$ 最长的“位置递增的连续后缀值链”长度，即从 $n$ 往下找最长的 $m$，使值 $m,m+1,\dots,n$ 在数组中的位置递增（统计 `id[i] < id[i+1]` 从后往前的连续长度），这些数可以不动，其余元素依次放到最前。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
struct FenwickTree {
    int tr[N];
    void init() { memset(tr, 0, sizeof(tr)); }
    void update(int p, int v) {
        for (; p < N; p += ((p) & -(p))) {
            tr[p] = max(tr[p], v);
        }
    }
    int query(int p) {
        int res = 0;
        for (; p; p -= ((p) & -(p))) res = max(res, tr[p]);
        return res;
    }
};
typedef __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
                         __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    oset;
ll work1(int n, vector<int>& a) {
    oset s;
    for (auto i : a) s.insert(i);
    ll ans = 0;
    for (auto i : a) {
        ans += s.order_of_key(i);
        s.erase(i);
    }
    return ans;
}
int work2(int n, vector<int>& a) {
    vector<int> vis(n + 1, 0);
    int cycles = 0;
    for (int i = 1; i <= n; i++) {
        if (!vis[i]) {
            cycles++;
            for (int j = i; !vis[j]; j = a[j - 1]) vis[j] = 1;
        }
    }
    return n - cycles;
}
int work3(int n, vector<int>& a) {
    FenwickTree T;
    T.init();
    int ans = 0;
    for (int i = 0; i <= n - 1; i++) {
        int x = T.query(a[i] - 1) + 1;
        ans = max(ans, x);
        T.update(a[i], x);
    }
    return n - ans;
}
int work4(int n, vector<int> a) {
    vector<int> id(n + 1);
    for (int i = 0; i <= n - 1; i++) id[a[i]] = i;
    int ans = n - 1;
    for (int i = n - 1; i >= 1; i--) {
        if (id[i] > id[i + 1]) {
            break;
        }
        ans--;
    }
    return ans;
}
void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i <= n - 1; i++) cin >> a[i];
    cout << work1(n, a) << " ";
    cout << work2(n, a) << " ";
    cout << work3(n, a) << " ";
    cout << work4(n, a) << '\n';
}
```

:::

### Cyclic Array


**题目大意**：给定长度为 $n$ 的环形数组（$n \le 2 \times 10^5$，第 $n$ 个元素与第 1 个元素也算相邻）和上限 `k`，把它切成若干连续段（段落在环上），使每段的和都不超过 `k`，求最少的段数（数据保证至少存在一种切法）。

**解题思路**：先断环成链：把数组复制两倍并预处理前缀和。用双指针求出 `up[i][0]`——从位置 `i` 出发、贪心取尽可能长的一段（和不超过 `k`）能到达的最右位置；再用倍增求出 `up[i][j]`——从 `i` 出发跳 $2^j$ 段后到达的位置。随后对每个起点 `s`（$0\le s<n$）求覆盖 $n$ 个元素所需的最少段数：从高位到低位枚举 $j$，只要跳完后还没到达 $s+n$ 就跳过去并累加段数，最后补上收尾的那一段。不同起点对应环形数组的不同切法，取最小值即为答案。贪心段取到最长不会比别的取法差：任何合法切法的第一段结束位置都不晚于它，之后归纳即可；倍增则把段数按二进制拆开计数。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    vector<ll> sum(2 * n + 1, 0);
    for (int i = 0; i < 2 * n; i++) sum[i + 1] = sum[i] + a[i % n];
    int LOG = 19;
    vector<vector<int>> up(2 * n + 1, vector<int>(LOG));
    int r = 0;
    for (int i = 0; i < 2 * n; i++) {
        while (r < 2 * n && sum[r + 1] - sum[i] <= k) r++;
        up[i][0] = r;
    }
    for (int j = 0; j < LOG; j++) up[2 * n][j] = 2 * n;
    for (int j = 1; j < LOG; j++)
        for (int i = 0; i < 2 * n; i++) up[i][j] = up[up[i][j - 1]][j - 1];
    int ans = n;
    for (int s = 0; s < n; s++) {
        int cur = s, cnt = 0;
        for (int j = LOG - 1; j >= 0; j--)
            if (up[cur][j] < s + n) {
                cur = up[cur][j];
                cnt += 1 << j;
            }
        cnt++;
        ans = min(ans, cnt);
    }
    cout << ans << '\n';
}
```

:::

### List of Sums


**题目大意**：给定长度为 $n$（$3 \le n \le 100$）的正整数数组 `A` 的所有两两元素之和（共 $n(n-1)/2$ 个，以任意顺序给出），要求还原出数组 `A`，输出任意一组解（顺序任意）。

**解题思路**：先把这些和排序，记排序后的列表为 $B$，并设要还原的数组为 $a_1\le a_2\le\cdots\le a_n$。$B$ 中最小的元素必是 $a_1+a_2$、次小的必是 $a_1+a_3$（含 $a_1$ 的和最小）。如果第 `k` 个元素是 $a_2+a_3$，那么 $a_1=\frac{(a_1+a_2)+(a_1+a_3)-(a_2+a_3)}{2}=\frac{b_0+b_1-b_k}{2}$，因此枚举所有使 $b_0+b_1-b_k$ 为偶数的 `k`，就试遍了 $a_2+a_3$ 可能的位置。确定 $a_1$ 后逐个定出其余元素：当前未使用的最小和必然是 $a_1$ 与尚未确定的最小下标的值之和，据此依次得到 $a_2,a_3,\dots,a_n$；每定出一个值就把所有由它和已确定元素组成的和从列表中删去，删的过程中若发现某个和不存在，说明这组尝试失败、换下一个 `k` 重试。全部和都被成功匹配（用 `id == m` 判断，$m=n(n-1)/2$）即输出这组解。时间复杂度为 $O(n^2\log n)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    int m = n * (n - 1) / 2;
    vector<ll> b(m);
    for (auto& v : b) cin >> v;
    sort(b.begin(), b.end());

    vector<ll> a(n);
    for (int i = 2; i < m; i++) {
        ll t = b[0] + b[1] - b[i];            // = 2 * a[0]，也就是猜 b[i] 是 a[1] + a[2]
        if (t % 2)
            continue;
        a[0] = t / 2;
        a[1] = b[0] - a[0];
        a[2] = b[1] - a[0];
        if (a[0] < 1 || a[1] < a[0] || a[2] < a[1])
            continue;

        multiset<ll> rest;                    // 还没被用掉的和（去掉 b[0]、b[1] 与猜中的那一项）
        for (int j = 2; j < m; j++)
            if (j != i)
                rest.insert(b[j]);

        bool ok = true;
        for (int j = 3; j < n && ok; j++) {
            ll sm = *rest.begin();            // 剩余的最小和必是 a[0] + a[j]
            a[j] = sm - a[0];
            if (a[j] < a[j - 1]) {
                ok = false;
                break;
            }
            for (int k = 0; k < j; k++) {     // 撤掉 a[k] + a[j] 这一批和
                auto it = rest.find(a[k] + a[j]);
                if (it == rest.end()) {
                    ok = false;
                    break;
                }
                rest.erase(it);
            }
        }
        if (ok) {
            for (int j = 0; j < n; j++)
                cout << a[j] << " \n"[j + 1 == n];
            return;
        }
    }
}
```

:::

## Additional Problems II

### Bouncing Ball Steps


**题目大意**：在 $n\times m$ 的网格中，球从左上角 `(1, 1)` 出发沿对角线方向移动（每步行、列坐标各变化 $\pm1$），碰到边界就反弹。给定步数 `k`，依次输出 `k` 步后球所在位置的行坐标、列坐标，以及这 `k` 步中球到达边界的次数——行方向到达上/下边界或列方向到达左/右边界各算一次，同一步里两侧都到达（球位于四角）只算一次。

**解题思路**：行、列两个方向的运动相互独立，各自在区间 $[1,n]$、$[1,m]$ 上以周期 $2(n-1)$、$2(m-1)$ 往返。`fold(t, L)` 直接算出沿长 `L` 的坐标轴走 `t` 步后的位置：令 $r=t\bmod 2(L-1)$，$r\le L-1$ 时位置为 $r+1$，否则为 $2L-1-r$——相当于把折返展开成 $[0,2(L-1))$ 上的单向直行，再把超过一半的部分对折回来（起点 `(1, 1)` 对应 $t=0$）。到达次数分方向数：行方向的位置每 $n-1$ 步回到上/下边界一次，故 `k` 步内共 $\lfloor k/(n-1)\rfloor$ 次，列方向同理为 $\lfloor k/(m-1)\rfloor$ 次；若某一步两个方向同时到达（即 $n-1$ 与 $m-1$ 同时整除步数，此时球在四角），这一次会被两个方向重复计数，需减去 $\lfloor k/\operatorname{lcm}(n-1,m-1)\rfloor$ 次。代码里 `a = n - 1`、`b = m - 1`，`k / (a / std::gcd(a, b) * b)` 就是用整除（下取整）求这最后一项，三者相加即总到达次数。每组的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
ll fold(ll t, ll L) {
    ll T = 2 * (L - 1);
    ll r = t % T;
    if (r <= L - 1)
        return r + 1;
    return 2 * L - 1 - r;
}
void solve() {
    ll n, m, k;
    cin >> n >> m >> k;
    ll row = fold(k, n), col = fold(k, m);
    ll a = n - 1, b = m - 1;
    ll changes = k / a + k / b - k / (a / std::gcd(a, b) * b);
    cout << row << ' ' << col << ' ' << changes << '\n';
}
```

:::

### Bouncing Ball Cycle


**题目大意**：在 $n\times m$ 的网格中，球从左上角 `(1, 1)` 出发沿对角线方向移动（每步行、列坐标各变化 $\pm1$），碰到边界就反弹。求球第一次回到 `(1, 1)` 所需的步数，以及这期间访问过的不同格子数。

**解题思路**：

- **观察**：两个方向仍各自独立往返，行方向每 $2(n-1)$ 步、列方向每 $2(m-1)$ 步回到原相位，故轨迹周期为 $P=\operatorname{lcm}(2(n-1),2(m-1))$，也就是第一次回到 `(1, 1)` 的步数；代码里 `a = n - 1`、`b = m - 1`、`g = gcd(2 * a, 2 * b)`，$P$ 即 `(2 * a / g) * 2 * b`。

- **判据**：记格子的 $u=x-1$、$v=y-1$。该格在轨迹上出现，当且仅当存在时刻 $t$ 使行、列相位分别满足 $t\equiv\pm u\pmod{2a}$ 与 $t\equiv\pm v\pmod{2b}$（相位等于 $u$ 或 $2a-u$ 都能折回到同一格）；这样的同余方程组有解，当且仅当某一对符号下的两条同余式模 $g$ 相容，即 $u\equiv\pm v\pmod g$（格子坐标总有 $u\in[0,a]$、$v\in[0,b]$）。

- **做法**：按"内部格、四条边、四个角"分类统计满足上述同余的格子。内部格（$u\in[1,a-1]$、$v\in[1,b-1]$）里 $u\equiv v$ 的个数记为 `U1`、$u\equiv -v$ 的个数记为 `U2`，而同时满足这两条同余、被重复计数的部分记为 `U3`（即 $2(u-v)\equiv0\pmod g$ 的解，仅在 `g` 为偶数时多出一族），`II = U1 + U2 - U3`；每个这种计数都用 `cntRange(H, r, mod)`（统计 $[1,H]$ 内模 `mod` 余 `r` 的个数，整除分段 $O(1)$ 求出）完成。边上的格子只有一个方向能折返，相位约束退化为单条同余（如左边界 $u=0$ 要求 $g\mid v$），代码分别用 `e1y`、`eny`、`ex1`、`exm` 统计；四个角（$u\in\{0,a\}$、$v\in\{0,b\}$）逐个判定，记在 `corners` 里。两类内部同余的和可能出现重复计数，`U3` 正是容斥修正项。

- **正确性**：判据给出了"时刻—格子"的完整刻画——判据成立 ⟺ 该格在周期内被访问到；分类按边界位置划分，互不重叠且覆盖全部格子，故相加即不同格子总数。每组的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
ll cntRange(ll H, ll r, ll mod) {
    if (H < 1)
        return 0;
    r %= mod;
    if (r < 0)
        r += mod;
    ll first = r;
    if (first < 1)
        first += ((1 - first + mod - 1) / mod) * mod;
    if (first > H)
        return 0;
    return (H - first) / mod + 1;
}
void solve() {
    ll n, m;
    cin >> n >> m;
    ll a = n - 1, b = m - 1;
    ll g = std::gcd(2 * a, 2 * b);
    ll P = (2 * a / g) * 2 * b;
    ll ra = a % g, rb = b % g;
    ll nra = (g - ra) % g, nrb = (g - rb) % g;
    ll A = a - 1, B = b - 1;
    ll qa = A / g, sra = A % g;
    ll qb = B / g, srb = B % g;

    ll U1 = g * qa * qb + qa * srb + qb * sra + min(sra, srb);
    ll U2 = g * qa * qb + qa * srb + qb * sra + max(0LL, sra + srb - g + 1);
    ll U3 = qa * qb;
    if (g % 2 == 0) {
        ll mid = g / 2;
        U3 += (qa + (mid <= sra)) * (qb + (mid <= srb));
    }
    ll II = U1 + U2 - U3;

    ll e1y = cntRange(B, 0, g);
    ll eny = (ra == nra) ? cntRange(B, ra, g)
                         : cntRange(B, ra, g) + cntRange(B, nra, g);
    ll ex1 = cntRange(A, 0, g);
    ll exm = (rb == nrb) ? cntRange(A, rb, g)
                         : cntRange(A, rb, g) + cntRange(A, nrb, g);

    ll corners = 1 + (rb == 0) + (ra == 0) + ((ra == rb || ra == nrb) ? 1 : 0);
    cout << P << ' ' << II + e1y + eny + ex1 + exm + corners << '\n';
}
```

:::

### Knight Moves Queries


**题目大意**：无限棋盘按行列编号 $1,2,3,\dots$ 使用（马走日字，且始终不能跳出棋盘），给出 `n` 次询问，每次给一个起点 `(x, y)`，求马从该点走到 `(1, 1)` 的最少步数。

**解题思路**：

- **观察**：把目标平移到原点，由棋盘关于两条轴的对称性可只考虑第一象限，记 $x=|x_0-1|$、$y=|y_0-1|$ 并交换使 $x\ge y\ge0$。下界有三条：马每步至多让较大的那个坐标减 2，至多让 $x+y$ 减 3，且每步 $x+y$ 的奇偶必然翻转——所以步数 `d` 必须满足 $d\ge\max(\lceil x/2\rceil,\lceil (x+y)/3\rceil)$ 且 $d\equiv x+y\pmod2$。

- **做法**：取满足上述下界与奇偶性的最小 `d`（代码先算 $\max$，再用 `while ((d - (x + y)) % 2 != 0) d++` 修正奇偶，至多加 1）即为答案；只有三个小规模例外要特判：$(x,y)=(1,0)$ 需 3 步，$(1,1)$、$(2,2)$ 各需 4 步。可达性可由构造归纳：$y\ge1$ 时先走一步 $(2,1)$，剩余 $(x-2,y-1)$ 的下界恰好是 $d-1$、奇偶也同步改变，归纳即得；$y=0$ 时用 $(2,1)$ 与 $(2,-1)$ 交替推进，`x` 为奇数时在途中插入一步 $(1,2)$ 调整。

- **边界**：起点就是 `(1, 1)`（变换后 $x=y=0$）时答案为 0；三个例外必须特判——$(1,0)$ 的下界是 $\max(1,1)=1$，与真正的 3 步相差 2，不特判会输出过小值。

- **正确性**：下界来自"每步坐标变化量的上界"与奇偶翻转，任何方案都不能突破；上述构造说明除三个例外外该下界总能达到。每组的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    while (n--) {
        ll x, y;
        cin >> x >> y;
        x = llabs(x - 1);
        y = llabs(y - 1);
        if (x < y)
            swap(x, y);
        if (x == 1 && y == 0) {
            cout << 3 << '\n';
            continue;
        }
        if (x == 1 && y == 1) {
            cout << 4 << '\n';
            continue;
        }
        if (x == 2 && y == 2) {
            cout << 4 << '\n';
            continue;
        }
        ll d = max((x + 1) / 2, (x + y + 2) / 3);
        while ((d - (x + y)) % 2 != 0) d++;
        cout << d << '\n';
    }
}
```

:::

### K Subset Sums I


**题目大意**：给 `n` 个可正可负的整数，输出所有 $2^n$ 个子集的和（含空集的 0）中最小的 `k` 个，按升序输出，重复的和重复输出。

**解题思路**：

- **观察**：把负数单独处理：设负数的绝对值数组为 $c$、绝对值总和为 $C$，则"选中一些负数"的贡献是 $-\sum_{i\in S}c_i=\sum_{i\notin S}c_i-C$。由于子集族对取补封闭，负数部分能取到的全部取值，恰好是 $c$ 的子集和集合整体平移 $-C$，于是问题归结为"非负数组的前 `k` 小子集和"。

- **做法**：非负数组排序后用堆枚举前 `k` 小子集和：状态 `(s, i)` 表示和为 `s`、最后加入的是第 `i` 个元素（初始为 `(0, -1)`），`kSmallSums` 每次弹出最小的 `(s, i)` 并扩展出 `(s + a[i+1], i+1)`（接上后一个元素）与 `(s - a[i] + a[i+1], i+1)`（把最后一个元素换成后一个）；每个子集按"加入顺序"唯一对应一条状态链，故不重不漏，弹出顺序即和的不减序。正、负两部分各取前 `k` 小后（负数部分套用平移 $-C$），用另一个堆做二路归并：把 `X[i] + Y[0]` 入堆，每次弹出最小的 `(sum, i, j)` 后把同一行的下一个组合 `(X[i] + Y[j+1], i, j+1)` 入堆，连续输出前 `k` 个和。

- **边界**：`X`、`Y` 至少各含"空集和"0（`kSmallSums` 对空数组也返回 `{0}`），故归并时堆不会取空；代码中 `if (X.empty()) X.push_back(0)` 一类兜底不会触发。

- **正确性**：堆中弹出的每个状态都是当前未枚举状态中的最小和，故枚举序列按和单调不减；扩展方式与子集的一一对应保证不漏。总时间复杂度为 $O(n\log n+k\log k)$，空间复杂度为 $O(n+k)$。

:::details[题解(C++)]

```c++
vector<ll> kSmallSums(vector<ll> a, int k) {
    sort(a.begin(), a.end());
    vector<ll> res;
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<pair<ll, int>>>
        pq;
    pq.push({0, -1});
    while ((int)res.size() < k && !pq.empty()) {
        auto [s, i] = pq.top();
        pq.pop();
        res.push_back(s);
        if (i + 1 < (int)a.size()) {
            pq.push({s + a[i + 1], i + 1});
            if (i >= 0)
                pq.push({s - a[i] + a[i + 1], i + 1});
        }
    }
    return res;
}
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> pos, negabs;
    ll totalNeg = 0;
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        if (x >= 0)
            pos.push_back(x);
        else {
            negabs.push_back(-x);
            totalNeg += -x;
        }
    }
    auto X = kSmallSums(negabs, k);
    auto Y = kSmallSums(pos, k);
    for (auto& v : X) v -= totalNeg;
    if (X.empty())
        X.push_back(0);
    if (Y.empty())
        Y.push_back(0);
    priority_queue<tuple<ll, int, int>, vector<tuple<ll, int, int>>,
                   greater<tuple<ll, int, int>>>
        pq;
    for (int i = 0; i < (int)X.size(); i++) pq.push({X[i] + Y[0], i, 0});
    for (int t = 0; t < k; t++) {
        auto [s, i, j] = pq.top();
        pq.pop();
        cout << s << ' ';
        if (j + 1 < (int)Y.size())
            pq.push({X[i] + Y[j + 1], i, j + 1});
    }
    cout << '\n';
}
```

:::

### K Subset Sums II

**题目大意**：给 `n` 个整数（$n \le 2 \times 10^5$，允许为负）与 `m`、`k`（$m < n$，$k \le \min\left(\binom{n}{m}, 2 \times 10^5\right)$），输出所有大小恰为 `m` 的子集中，和最小的 `k` 个（升序，重复按多次计）。

**解题思路**：

- **观察**：把数组升序排序后，最小的 `m` 元子集就是前 `m` 个数；其余任何 `m` 元子集都能由它出发、每次把某个被选中的下标往右挪一格得到。因为数组升序，每一步挪动只会让和不变或变大，于是可以在一棵「每个 `m` 元子集恰好出现一次」的树上做最佳优先搜索。负数不需要特殊处理——起点仍取最小的 `m` 个数。

- **做法**：状态是 `(sum, i, j, kk)`：位置 $1..i$ 是已确定的连续前缀，`j` 是当前可移动的那个被选中位置，`kk` 是 `j` 之后下一个被选中的位置（`n + 1` 表示没有）。初始状态取 `(前 m 个之和, m - 1, m, n + 1)`。每次弹出当前最小和并输出，再按两条规则扩展：`j + 1 < kk` 时把 `j` 右移一格（新和为原和加上 $a[j+1]-a[j]$，`j` 加一）；`i > 0 && i + 1 < j` 时把前缀末尾那个元素右移一格（新和为原和加上 $a[i+1]-a[i]$，`i` 减一、`j` 改成原来的 $i+1$）。

- **正确性**：两条转移的守卫 `j + 1 < kk` 与 `i + 1 < j` 保证被选中的下标永不碰撞，于是每个 `m` 元子集在搜索树上恰好出现一次（把「可移动元素向左推一格」当作父亲，唯一回溯到初始状态）。又因为 $a$ 升序，两条转移的增量 $a[j+1]-a[j]$ 与 $a[i+1]-a[i]$ 都非负，故父亲的和不超过儿子的和。在一棵边权非负的树上，用优先队列从根开始最佳优先扩展，第 $t$ 次弹出的就是第 $t$ 小的和，因此前 `k` 次弹出即为答案。

- **边界**：$m = 1$ 时第二条转移永不触发，第一条会依次枚举出全部单元素子集；$k$ 等于 $\binom{n}{m}$ 时堆恰好弹完、不会空堆；和最大约 $2 \times 10^5 \times 10^9$，必须用 64 位整数。总时间复杂度为 $O(n\log n + k\log k)$，空间复杂度为 $O(n + k)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    ll k;
    cin >> n >> m >> k;
    vector<ll> a(n + 1), pre(n + 1, 0);
    for (int i = 1; i <= n; i++)
        cin >> a[i];
    sort(a.begin() + 1, a.end());
    for (int i = 1; i <= n; i++)
        pre[i] = pre[i - 1] + a[i];
    using St = tuple<ll, int, int, int>;
    priority_queue<St, vector<St>, greater<St>> pq;
    pq.push({pre[m], m - 1, m, n + 1});
    ll cnt = 0;
    while (cnt < k && !pq.empty())
    {
        auto [s, i, j, kk] = pq.top();
        pq.pop();
        if (cnt)
            cout << ' ';
        cout << s;
        cnt++;
        if (j + 1 < kk)
            pq.push({s + a[j + 1] - a[j], i, j + 1, kk});
        if (i > 0 && i + 1 < j)
            pq.push({s + a[i + 1] - a[i], i - 1, i + 1, j});
    }
    cout << '\n';
}
```

:::

### Increasing Array II


**题目大意**：给长度为 `n` 的数组（$n\le2\times10^5$），每次操作可以把任意一个元素加 1 或减 1，求把数组变成非下降序列所需的最少操作次数。

**解题思路**：问题等价于选一个非降序列 $b_1\le\dots\le b_n$ 最小化 $\sum_i|a_i-b_i|$。从左到右处理，用大根堆维护"此前各位置暂定取值"的多重集：读入 $a_i$ 先把它入堆；若堆顶 $M>a_i$，说明有一个更早的位置取值为 $M$、而当前元素取 $a_i$，二者违反非降，这一步必须付出代价 $M-a_i$——无论把 $M$ 压低到 $a_i$ 还是把 $a_i$ 抬到 $M$，本步代价都是 $M-a_i$；贪心取"压低"，因为压低后该位置对右侧元素的约束更松（非降只要求右侧不小于左侧），不会比抬高更差。于是累加 $M-a_i$，弹出堆顶并压入 $a_i$（把该位置改写为 $a_i$，同时让当前元素以 $a_i$ 入堆，故堆中元素之和始终等于「已读元素之和减已付代价」）。每步的代价都是该步不可回避的下界，累加值即最优总代价。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    priority_queue<ll> pq;
    ll ans = 0;
    for (int i = 0; i < n; i++) {
        ll v;
        cin >> v;
        pq.push(v);
        if (pq.top() > v) {
            ans += pq.top() - v;
            pq.pop();
            pq.push(v);
        }
    }
    cout << ans << '\n';
}
```

:::

### Food Division


**题目大意**：`n` 个孩子围坐在圆桌旁（$n\le2\times10^5$），第 `i` 个孩子现有 $a_i$ 份食物、想要 $b_i$ 份（保证总量相等）。每一步一个孩子可以把 1 份食物传给相邻的孩子，求达到目标所需的最少步数。

**解题思路**：

- **观察**：记盈余 $d_i=a_i-b_i$、前缀和 $s_i=d_1+\dots+d_i$。把圆桌从孩子 `n` 与孩子 1 之间"剪开"拉成一条链，设这条切口边上沿某一方向流过的净份数为 `c`（可为负）：链上其余每条边都必须承担对应前缀的净流量，即孩子 `i` 与 $i+1$ 之间的边要净流过 $s_i-c$ 份，于是总步数为 $\sum_{i=1}^{n}|s_i-c|$——每流动一份恰好一步。

- **做法**：$f(c)=\sum_i|s_i-c|$ 是 `c` 的凸函数，在 `c` 取所有 $s_i$ 的中位数时取最小值（一维绝对值和的中位数性质），故把前缀和排序后取 `med = s[n / 2]`，输出 $\sum_i|s_i-med|$。

- **边界**：切口流量 `c` 可取任意整数（不必是某个 $s_i$），取上中位数或下中位数结果相同；前缀和可能较大，需要用 64 位整数保存。

- **正确性**：每条链边承担的净流量由它左侧盈余之和减切口流量决定，绝对值 $|s_i-c|$ 是其步数下界，而这些下界可同时取到（把每条边的流量按 $s_i-c$ 的符号方向落实即可），故对固定的 `c` 该值就是最少步数，再对 `c` 取最优即答案。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n), b(n);
    for (auto& v : a) cin >> v;
    for (auto& v : b) cin >> v;
    vector<ll> s;
    ll pref = 0;
    for (int i = 0; i < n; i++) {
        pref += a[i] - b[i];
        s.push_back(pref);
    }
    sort(s.begin(), s.end());
    ll med = s[n / 2];
    ll ans = 0;
    for (auto v : s) ans += llabs(v - med);
    cout << ans << '\n';
}
```

:::

### Swap Round Sorting


**题目大意**：给一个 $1..n$ 的排列。每一轮可以同时交换任意多对互不相交的元素（每个元素每轮至多参与一次交换）。求把它排成升序所需的最少轮数并输出方案：第一行是轮数 `r`，随后对每一轮先输出该轮的交换对数，再逐行输出每对的下标；轮数为 0 时只输出一个 0。

**解题思路**：

- **观察**：一轮交换等价于给排列右乘一个对合（若干互不相交的对换之积）。任意排列都能写成两个对合的乘积，故至多 2 轮；恰需 1 轮当且仅当排列本身是对合（所有环长 $\le2$：此时把每个 2-环的两个元素对换即可），已经升序则为 0 轮。

- **做法**：逐个处理 $x$ 的每个长度 $L\ge2$ 的环 $(c_0,c_1,\dots,c_{L-1})$（沿 $c_{i+1}=x[c_i]$ 列出，$x$ 把 $c_{L-1}$ 映回 $c_0$）。第 1 轮做"首尾配对"的反射：交换 $(c_i,c_{L-1-i})$，$0\le i\le\lfloor(L-1)/2\rfloor$，中间元素与自己配对时跳过；若 $L\ge3$，第 2 轮再交换 $(c_i,c_{L-i})$，$1\le i\le\lfloor L/2\rfloor$。同一轮内的各对下标互不重复，故可同时执行；而只在某个环产生过交换的轮才输出（`r1`、`r2` 都为空时轮数为 0）。

- **正确性**：两轮先后作用后，每个环内 $c_i$ 恰好被送到 $c_{i+1}$（第一轮的反射把环翻成反向，第二轮再错开一位复位），于是整个排列变成升序；轮数按"已升序 / 对合 / 其他"取 0、1、2，由观察即为最少。总时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> x(n + 1);
    for (int i = 1; i <= n; i++) cin >> x[i];
    vector<pair<int, int>> r1, r2;
    vector<int> vis(n + 1, 0);
    for (int s = 1; s <= n; s++) {
        if (vis[s] || x[s] == s)
            continue;
        vector<int> cyc;
        int u = s;
        do {
            vis[u] = 1;
            cyc.push_back(u);
            u = x[u];
        } while (u != s);
        int L = cyc.size();

        for (int i = 0; i <= (L - 1) / 2; i++) {
            int a = cyc[i], b = cyc[L - 1 - i];
            if (a != b)
                r1.push_back({a, b});
        }

        if (L >= 3) {
            for (int i = 1; i <= L / 2; i++) {
                int a = cyc[i], b = cyc[L - i];
                if (a != b)
                    r2.push_back({a, b});
            }
        }
    }
    vector<vector<pair<int, int>>> rounds;
    if (!r1.empty())
        rounds.push_back(r1);
    if (!r2.empty())
        rounds.push_back(r2);
    cout << rounds.size() << '\n';
    for (auto& rd : rounds) {
        cout << rd.size() << '\n';
        for (auto& p : rd) cout << p.first << ' ' << p.second << '\n';
    }
}
```

:::

### Binary Subsequences


**题目大意**：构造一个最短的二进制串，使它恰好有 `n` 个不同的非空子序列（$n\le10^6$），输出该串。

**解题思路**：

- **观察**：只需跟踪两个量：以 0 结尾的不同非空子序列数 `a` 和以 1 结尾的 `b`，串的不同非空子序列总数就是 $a+b$。从状态 $(a,b)$ 追加一个 0 时，所有已有子序列（连空集）都能再接一个 0，故新状态为 $(a+b+1,b)$；追加 1 对称，为 $(a,a+b+1)$。反过来，给定目标 $(a,b)$ 时最后一个字符被唯一确定：$a>b$ 只能是 0（前驱 $(a-b-1,b)$），$b>a$ 只能是 1（前驱 $(a,b-a-1)$）；而 $a=b$ 只可能是 $(0,0)$（空串）——因为任何一次追加之后两个数都不再相等。

- **做法**：枚举"以 0 结尾 / 以 1 结尾"的目标拆分 $(i,n-i)$，$1\le i\le n-1$。用 `valid(a, b)` 判断 $(a,b)$ 是否可达：相等时必须都是 0，否则把小的记为 `a`、大的记为 `b` 并递归到 `valid(a, b % (a + 1))`——若当前大的数是 `b`，从它往回走的最后若干步必然连续追加 1，每次把 `b` 减少 `a+1`，故可用一次取模批量约化，这是欧几里得式的收敛。可达时从 $(i,n-i)$ 反向逐字符确定（`l > r` 取 0 并 `l -= r + 1`，否则取 1 并 `r -= l + 1`），把结果翻转即候选串；在所有可达拆分中取长度最短的。

- **边界**：所有拆分都不可达时（$n=1$ 时循环一次都不执行）输出 `n` 个 `1`：全 1 串的不同非空子序列恰为 $1,11,\dots$ 共 `n` 个，长度与全 0 串同为 `n`，也是最短。另外只含单一字符的串其不同非空子序列数等于长度，因此长度小于 `n` 的最优串必然同时含 0 和 1，会被上述枚举覆盖。

- **正确性**：追加规则与"末字符唯一确定"给出串与状态之间的双向对应，`valid` 的模约化等价于逐次回溯，故构造出的串恰有 `n` 个不同非空子序列；再对所有可行拆分取最短，即得最短串。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$（存下当前最优串）。

:::details[题解(C++)]

```c++
bool valid(ll a, ll b) {
    if (a == b)
        return a == 0;
    if (a > b)
        swap(a, b);
    return valid(a, b % (a + 1));
}
void solve() {
    ll n;
    cin >> n;
    string best;
    for (ll i = 1; i <= n - 1; i++) {
        ll l = i, r = n - i;
        if (!valid(l, r))
            continue;

        string s;
        while (l || r) {
            if (l > r) {
                s += '0';
                l -= r + 1;
            } else {
                s += '1';
                r -= l + 1;
            }
        }
        if (best.empty() || s.size() < best.size())
            best = s;
    }
    if (best.empty()) {
        for (ll i = 0; i < n; i++) cout << '1';
        cout << '\n';
        return;
    }
    reverse(best.begin(), best.end());
    cout << best << '\n';
}
```

:::

### School Excursion


**题目大意**：`n` 个孩子去赫尔辛基，每人可去动物园或游乐园；给出 `m` 对朋友关系，每对朋友必须去同一个景点。输出长度为 `n` 的 01 串，第 `i` 位为 1 表示"恰好有 `i` 个孩子去动物园"是可以实现的，为 0 表示不可实现。

**解题思路**：

- **观察**：朋友关系把孩子们分成若干连通块（并查集统计每块大小），同一块内的人必须同去一处，因此一个大小为 `s` 的块对"去动物园人数"的贡献只能是 0 或 `s`。记 `num[i]` 为大小恰为 `i` 的块数，问题变成：面值 `i` 的硬币有 `num[i]` 枚，能凑出 $0..n$ 中的哪些总额。

- **做法**：做**有界背包**，`dp[j]` 表示能否凑出 `j` 人去动物园。对每种大小 `i` 单独处理，用计数数组 `c[j]` 记录"凑出 `j` 时已用了多少枚面值 `i` 的硬币"：只有当 `dp[j]` 尚不可达、`dp[j - i]` 可达且 `c[j - i] < num[i]` 时才令 `dp[j] = true`、`c[j] = c[j - i] + 1`。同面值硬币彼此等价，故在同一条模 `i` 同余的链上正序推进即可保证不超过 `num[i]` 枚。

- **边界**：`dp[0] = true`（一个孩子都不去动物园总可实现），输出从 `i = 1` 开始、共 `n` 位；朋友关系允许重复或自环（`a = b`），并查集不受影响。

- **正确性**：每块独立二选一，背包恰好枚举了"选哪些块去动物园"的全部组合；块大小的不同取值只有 $O(\sqrt n)$ 种（$\sum_i i\cdot num[i]=n$），每种做一轮 $O(n)$ 的转移，故总时间复杂度为 $O(n\sqrt n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int dsu[100005];
int Find(int x) {
    if (dsu[x] == x)
        return x;
    return dsu[x] = Find(dsu[x]);
}
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) dsu[i] = i;
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        dsu[Find(a)] = Find(b);
    }
    vector<int> cnt(n + 1, 0), num(n + 1, 0);
    for (int i = 1; i <= n; i++) cnt[Find(i)]++;
    for (int i = 1; i <= n; i++)
        if (cnt[i])
            num[cnt[i]]++;

    vector<bool> dp(n + 1, false);
    dp[0] = true;
    for (int i = 1; i <= n; i++) {
        if (!num[i])
            continue;
        vector<int> c(n + 1, 0);
        for (int j = i; j <= n; j++) {
            if (!dp[j] && dp[j - i] && c[j - i] < num[i]) {
                dp[j] = true;
                c[j] = c[j - i] + 1;
            }
        }
    }
    for (int i = 1; i <= n; i++) cout << (dp[i] ? '1' : '0');
    cout << '\n';
}
```

:::

### Coin Grid


**题目大意**：$n\times n$ 的网格（$n\le200$），每格为空或有硬币。每次操作可以清空一整行或一整列的所有硬币，求清空整个网格的最少操作次数并输出方案：第一行是操作数，随后每行两个整数，`1 i` 表示清空第 `i` 行、`2 j` 表示清空第 `j` 列。

**解题思路**：

- **观察**：把行、列分别看成二分图的左右部，格子 `(i, j)` 有硬币就连边 `i—j`。一次操作清空一行（或一列）等价于选中一个顶点并覆盖它关联的所有边，"清空整个网格"就是选一组顶点覆盖所有边，故最少操作数等于二分图的**最小点覆盖**；由 König 定理它又等于最大匹配数，用 Kuhn 求最大匹配。

- **做法**：最小点覆盖按标准构造给出：从每个未匹配的左部顶点出发，沿"未匹配边 → 匹配边"交替 DFS，得到交替可达点集 `Z`（代码用 `inZ[0]`、`inZ[1]` 分别标记左右部）。最小点覆盖为（左部 ∖ `Z`）∪（右部 ∩ `Z`）：输出左部中不在 `Z` 的行和右部中在 `Z` 的列。

- **边界**：一个硬币都没有时答案为 0；输出用 1 起始下标（代码输出 `i + 1`、`j + 1`）；Kuhn 每轮增广前都要清空 `used` 数组。

- **正确性**：图中每条边至少有一端落在构造出的点集中——若某条边的左端点可达，则沿这条边即可到达其右端点，故右端点也在 `Z` 中，覆盖成立；而该点集大小等于匹配数，由 König 定理即为最小点覆盖。总时间复杂度为 $O(n^3)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<string> g(n);
    for (auto& s : g) cin >> s;
    vector<vector<int>> G(n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (g[i][j] == 'o')
                G[i].push_back(j);

    vector<int> mt(n, -1);
    vector<char> used(n, 0);
    function<bool(int)> kuhn = [&](int u) {
        if (used[u])
            return false;
        used[u] = 1;
        for (int v : G[u]) {
            if (mt[v] == -1 || kuhn(mt[v])) {
                mt[v] = u;
                return true;
            }
        }
        return false;
    };
    for (int i = 0; i < n; i++) {
        fill(used.begin(), used.end(), 0);
        kuhn(i);
    }

    vector<char> inZ[2];
    inZ[0].assign(n, 0);
    inZ[1].assign(n, 0);
    function<void(int, int)> dfs = [&](int t, int u) {
        inZ[t][u] = 1;
        if (t == 0) {
            for (int v : G[u])
                if (!inZ[1][v])
                    dfs(1, v);
        } else {
            if (mt[u] != -1 && !inZ[0][mt[u]])
                dfs(0, mt[u]);
        }
    };
    for (int i = 0; i < n; i++)
        if (find(mt.begin(), mt.end(), i) == mt.end())
            dfs(0, i);
    vector<pair<int, int>> moves;
    for (int i = 0; i < n; i++)
        if (!inZ[0][i])
            moves.push_back({1, i + 1});
    for (int j = 0; j < n; j++)
        if (inZ[1][j])
            moves.push_back({2, j + 1});
    cout << moves.size() << '\n';
    for (auto& p : moves) cout << p.first << ' ' << p.second << '\n';
}
```

:::

### Grid Coloring II


**题目大意**：$n\times m$ 的网格，每格原字符是 A/B/C 之一。要求把每格改成 A/B/C 中**另一个**字符（不能与它原来的字符相同），并且任意两个相邻格子的字符都不相同；输出任一方案，无解输出 IMPOSSIBLE。

**解题思路**：

- **观察**：每格排除自己的原字符后只剩 2 个候选字符，可编码成一个布尔变量（取值 0/1 对应两个候选，代码用 `col(r, c, opt)` 取第 `opt` 个候选）。"相邻字符不同"是只涉及两个变量的二元约束，用 2-SAT 处理：变量是格子，对每对相邻格子 `(u, v)` 与每一对取值 $(o_1,o_2)$，若两个候选字符相同，就加入一对蕴含边 $u{=}o_1\Rightarrow v{\ne}o_2$ 与 $v{=}o_2\Rightarrow u{\ne}o_1$，即禁止这一组合同时出现（代码里由 `implies` 加边）。

- **做法**：用迭代版 Kosaraju 求强连通分量：第一遍 DFS 记录出栈序，第二遍在反图上按出栈序的逆序染色得到 `comp`。若某变量的两个取值落在同一 SCC（`comp[2 * v] == comp[2 * v + 1]`），说明蕴含关系自相矛盾，输出 IMPOSSIBLE；否则每个变量取 `comp` 较大的一侧为 0、另一侧为 1，逐格输出对应候选字符。

- **边界**：相邻关系只需枚举向右、向下两个方向（向上、向左是同一对边的反向）；$n=1$ 或 $m=1$ 时网格退化成一条链，2-SAT 仍然适用，同一行（列）内相邻格子也必须不同字符。

- **正确性**：2-SAT 的可满足性与"SCC 矛盾判定 + 取值规则"是标准等价关系，且每个格子的候选都排除了自己的原字符，故输出自动满足"改成了另一个字符"与"相邻不同"。总时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (auto& s : g) cin >> s;
    auto col = [&](int r, int c, int opt) {
        vector<char> opts;
        for (char ch : {'A', 'B', 'C'})
            if (ch != g[r][c])
                opts.push_back(ch);
        return opts[opt];
    };
    int N = n * m * 2;
    vector<vector<int>> adj(N), radj(N);
    auto implies = [&](int a, int va, int b, int vb) {
        adj[a + va].push_back(b + vb);
        radj[b + vb].push_back(a + va);
    };
    int dr[2] = {0, 1}, dc[2] = {1, 0};
    for (int r = 0; r < n; r++)
        for (int c = 0; c < m; c++)
            for (int d = 0; d < 2; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= n || nc >= m)
                    continue;
                int a = (r * m + c) * 2, b = (nr * m + nc) * 2;
                for (int o1 = 0; o1 < 2; o1++)
                    for (int o2 = 0; o2 < 2; o2++)
                        if (col(r, c, o1) == col(nr, nc, o2)) {
                            implies(a, o1, b, 1 - o2);
                            implies(b, o2, a, 1 - o1);
                        }
            }

    vector<char> vis(N, 0);
    vector<int> ord;
    for (int s = 0; s < N; s++) {
        if (vis[s])
            continue;
        vector<int> st = {s};
        vis[s] = 1;
        while (!st.empty()) {
            int u = st.back();
            bool pushed = false;
            for (int v : adj[u]) {
                if (!vis[v]) {
                    vis[v] = 1;
                    st.push_back(v);
                    pushed = true;
                    break;
                }
            }
            if (!pushed) {
                ord.push_back(u);
                st.pop_back();
            }
        }
    }
    vector<int> comp(N, -1);
    int cc = 0;
    for (int i = N - 1; i >= 0; i--) {
        int s = ord[i];
        if (comp[s] != -1)
            continue;
        vector<int> st = {s};
        comp[s] = cc;
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            for (int v : radj[u])
                if (comp[v] == -1) {
                    comp[v] = cc;
                    st.push_back(v);
                }
        }
        cc++;
    }
    for (int v = 0; v < n * m; v++)
        if (comp[2 * v] == comp[2 * v + 1]) {
            cout << "IMPOSSIBLE\n";
            return;
        }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < m; c++) {
            int base = (r * m + c) * 2;
            int opt = comp[base] > comp[base + 1] ? 0 : 1;
            cout << col(r, c, opt);
        }
        cout << '\n';
    }
}
```

:::

### Programmers and Artists


**题目大意**：公司要招 `a` 个程序员和 `b` 个艺术家（$a+b\le n\le2\times10^5$），共有 `n` 个应聘者，第 `i` 人的编程技能为 $x_i$、艺术技能为 $y_i$。被招为程序员的按 $x_i$ 计分、被招为艺术家的按 $y_i$ 计分，求技能总和的最大值；未被录用的人不计分。

**解题思路**：

- **观察**：按 $x$ 降序排序后可以假设：存在最优方案，其被录用者是"前 `i` 人中的全部，加上后面 `y` 最大的 $a+b-i$ 人"（交换论证：若某个程序员出现在第 `i` 人之后，而更靠前的人未被录用，把两人对调不会让总分变小，因为靠前者的 $x$ 不小于靠后者）。于是枚举分界线 `i`（$a\le i\le a+b$）。对固定的 `i`，前 `i` 人中有 `a` 个程序员、其余 $i-a$ 人当艺术家，总得分 = 前 `i` 人 $x$ 之和减去这些艺术家各自的 $(x-y)$；要最大化就让 $(x-y)$ **最小**的 $i-a$ 人当艺术家，即把 $(x-y)$ 最大的 `a` 人留作程序员。代码用大根堆放 $(x-y)$，堆内超过 `a` 个时弹出最小值并从和中减去，得到 `pre[i]`。

- **做法**：后缀部分用第二个大根堆从后往前维护 `suf[i]`：把 $y_i$ 入堆，堆内元素超过 $n-a-b$ 个时弹出当前最大者并累加，这样 `suf[i]` 恰为"第 `i` 人以及其后所有人中挑 $a+b-i+1$ 人当艺术家"的最大技能分之和。答案 $=\max_{a\le i\le a+b}\big(pre[i]+suf[i+1]\big)$：前 `i` 人贡献 `pre[i]`，第 $i+1$ 人之后贡献 `suf[i+1]`（即剩下 $a+b-i$ 个艺术家的最优选择）。

- **正确性**：排序后的交换论证给出"被录用者形如前缀 + 后缀中 $y$ 最大者"的结构；在固定结构下，程序员的选取用交换论证可证"$(x-y)$ 大者当程序员"最优；枚举 `i` 覆盖全部划分。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int a, b, n;
    cin >> a >> b >> n;
    vector<pair<ll, ll>> v(n);
    for (int i = 0; i < n; i++) cin >> v[i].first >> v[i].second;
    sort(v.begin(), v.end(), greater<pair<ll, ll>>());

    vector<ll> pre(n + 2, 0);
    {
        ll sum = 0;
        priority_queue<ll> q;
        for (int i = 1; i <= a + b; i++) {
            sum += v[i - 1].first;
            q.push(-(v[i - 1].first - v[i - 1].second));
            while ((int)q.size() > a) {
                sum += q.top();
                q.pop();
            }
            pre[i] = sum;
        }
    }

    vector<ll> suf(n + 3, 0);
    {
        ll sum = 0;
        priority_queue<ll> q;
        for (int i = n; i >= max(a, 1); i--) {
            q.push(v[i - 1].second);
            while ((int)q.size() > n - a - b) {
                sum += q.top();
                q.pop();
            }
            suf[i] = sum;
        }
    }
    ll ans = 0;
    for (int i = a; i <= a + b; i++) ans = max(ans, pre[i] + suf[i + 1]);
    cout << ans << '\n';
}
```

:::

### Removing Digits II


**题目大意**：给一个整数 `n`（$n\le10^{18}$），每一步可以从当前数中减去它的**任意一位数字**（可任选一位），求把 `n` 变成 0 的最少步数。

**解题思路**：

- **观察**：每次减去**当前最大数位**的贪心是最优的。设 $g(x)$ 表示按该贪心从 `x` 减到 0 的步数，先证引理：$g$ 单调不减，即 $g(N)\ge g(N-1)$。记 $m(x)$ 为 `x` 的最大数位，则 $g(N)=1+g(N-m(N))$、$g(N-1)=1+g(N-1-m(N-1))$。若 $m(N)\le m(N-1)$，则 $N-m(N)\ge N-1-m(N-1)$，由归纳假设（更小的数上单调性已成立）得 $g(N)\ge g(N-1)$；若 $m(N)>m(N-1)$，则 `N` 的个位必是 `N` 中唯一的最高数位，此时 $m(N-1)=m(N)-1$ 且 $N-m(N)=N-1-m(N-1)$，两个表达式相等，仍有 $g(N)=g(N-1)$。引理成立后，对 `x` 的任意数位 $e\le m(x)$ 都有 $x-e\ge x-m(x)$，由单调性 $g(x-e)\ge g(x-m(x))$——减最大数位不劣于减任何其他数位，逐层归纳即得贪心全局最优。

- **做法**：`n` 与答案都可能极大，不能逐值模拟，改用分治 + 记忆化：`get(cMax, val)` 返回一个 `(步数, 剩余值)` 二元组，`cMax` 是"更高位上已经确定的最大数位"。`val < 10` 时直接一步减去 $\max(cMax,val)$（`cMax` 与 `val` 同时为 0 时返回 0 步）；否则取最高位 `h = val / p`（`p` 为不超过 $val/10$ 的最大 10 的幂），先以 $\max(cMax,h)$ 递归处理低位 $val\bmod p$ 得到剩余 `rem`，再对 $h\cdot p + rem$ 递归处理。

- **边界**：低位减到不足时会"向高位借位"，因此递归返回的剩余值可以为负，与高位拼回后才是真实剩余；状态与 `(cMax, val)` 一一对应，`D[cMax]` 记忆化后转移次数很少。

- **正确性**：单调引理保证"减最大数位"逐位不劣，故贪心最优；分治把整个过程按十进制位拆开，先在"高位最大数位为 $\max(cMax,h)$"的前提下处理低位、再把低位剩余并入高位继续，与原过程完全一致。总时间复杂度为 $O(\log^2 n)$。

:::details[题解(C++)]

```c++
typedef pair<ll, ll> pii;
map<ll, pii> D[10];

pii get(ll cMax, ll val) {
    if (val < 10) {
        ll m = max(cMax, val);
        return {(cMax || val) ? 1 : 0, val - m};
    }
    if (D[cMax].count(val))
        return D[cMax][val];
    ll p = 1;
    while (p <= val / 10) p *= 10;
    pii Z = get(max(cMax, val / p), val % p);
    pii Z2 = get(cMax, val / p * p + Z.second);
    return D[cMax][val] = {Z.first + Z2.first, Z2.second};
}
void solve() {
    ll n;
    cin >> n;
    cout << get(0, n).first << '\n';
}
```

:::

### Coin Arrangement


**题目大意**：$2\times n$ 的网格（$n\le10^5$），每格有若干枚硬币、总硬币数为 $2n$。每次把一枚硬币向上、下、左或右移动一步，求让每格恰好 1 枚硬币所需的最少移动次数。

**解题思路**：先把每格的硬币数减 1，问题变成把每格盈亏清零。从左到右逐列处理，维护上、下两行"需要转运到右侧"的累计盈亏 `x`、`y`：处理到第 `i` 列时先把这一列的盈亏并入 `x`、`y`。若两者异号（代码用 $|x+y|<|x|+|y|$ 判定），说明上、下两行可以在本列内互相抵消，花 $\min(|x|,|y|)$ 步把一行的盈余垂直补给另一行；抵消不掉的盈亏只能经过列间边水平运往下一列，每个单位都要走一步，代价为 $|x|+|y|$。逐列累加即答案。

- **正确性**：第 `i` 列消化不掉的盈亏必然流过它与第 $i+1$ 列之间的两条边，故水平部分的下界就是 $|x|+|y|$；而同列上下的垂直转移只需 1 步、比"运到右侧再运回来"更短，故异号时先垂直抵消不会比任何方案差——两个方向都取到下界，贪心最优。总时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int n;
int a[100005][2];
void solve() {
    cin >> n;
    for (int j = 0; j <= 1; j++) {
        for (int i = 1; i <= n; i++) {
            cin >> a[i][j];
            a[i][j]--;
        }
    }
    ll ans = 0, x = 0, y = 0;
    for (int i = 1; i <= n; i++) {
        x += a[i][0];
        y += a[i][1];

        if (abs(x + y) < abs(x) + abs(y)) {
            if (abs(x) <= abs(y)) {
                ans += abs(x);
                y += x;
                x = 0;
            } else {
                ans += abs(y);
                x += y;
                y = 0;
            }
        }

        ans += abs(x);
        ans += abs(y);
    }
    cout << ans << '\n';
}
```

:::

### Replace with Difference


**题目大意**：给 `n` 个整数（$2\le n\le1000$，$1\le x_i\le1000$），反复进行 $n-1$ 次操作：每次选两个数 `a`、`b` 删去并加入 $|a-b|$。求一组操作序列使最后剩下的数为 0，无解输出 -1；输出的每行是两个被选中的数（共 $n-1$ 行）。

**解题思路**：

- **观察**：一次操作等价于给两个数赋上相反符号再求和，反复操作后剩下的数必形如 $|\pm x_1\pm\dots\pm x_n|$，反过来任意符号组合都能实现。于是能剩下 0 当且仅当能把 $n$ 个数分成两组、两组和相等，即总和 `S` 为偶数且存在和为 $S/2$ 的子集。

- **做法（判可行 + 分组）**：用 `bitset` 做子集和 DP，`dp[i + 1] = dp[i] | (dp[i] << x[i])`，检查 `dp[n][S / 2]`；可行则从 `dp` 反向回溯出分组：令 `t = S / 2`，从 `i = n-1` 往小扫描，若 `dp[i][t]` 成立说明不用 $x_i$、把它放进 `B`，否则必须用 $x_i$、放进 `A` 并 `t -= x[i]`。回溯结束时 `A`、`B` 的和相等。

- **做法（输出操作）**：只要两组都非空，就各取最小的一个数 `a`、`b`，输出 $(a,b)$，再把 $|a-b|$ 放回**原来较大者所在的组**——两组各减少一个数、且新值补在减少得多的那一组，组和相等的不变量因此保持。

- **边界**：`S` 为奇数或不存在和为 $S/2$ 的子集时输出 -1；若某组先被取空，则另一组剩下的元素全为 0（两组和相等且一侧为 0），逐对输出 `(0, 0)` 补到恰好 $n-1$ 次操作即可。总时间复杂度为 $O(nS/64)$，空间复杂度为 $O(nS/64)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> x(n);
    ll S = 0;
    for (auto& v : x) {
        cin >> v;
        S += v;
    }
    if (S % 2) {
        cout << -1 << '\n';
        return;
    }
    int T = S / 2;
    vector<bitset<500001>> dp(n + 1);   // 总和最大 $1000\times1000=10^6$，$S/2$ 不超过 5e5，正好装得下
    dp[0][0] = 1;
    for (int i = 0; i < n; i++) dp[i + 1] = dp[i] | (dp[i] << x[i]);
    if (!dp[n][T]) {
        cout << -1 << '\n';
        return;
    }
    multiset<int> A, B;
    int t = T;
    for (int i = n - 1; i >= 0; i--) {
        if (dp[i][t])
            B.insert(x[i]);
        else {
            A.insert(x[i]);
            t -= x[i];
        }
    }
    vector<pair<int, int>> ops;
    while (!A.empty() && !B.empty()) {
        int a = *A.begin(), b = *B.begin();
        ops.push_back({a, b});
        A.erase(A.begin());
        B.erase(B.begin());
        int c = abs(a - b);
        if (a > b)
            A.insert(c);
        else
            B.insert(c);
    }
    auto& rest = A.empty() ? B : A;
    int zc = (int)rest.size();
    for (int i = 1; i < zc; i++) ops.push_back({0, 0});
    for (auto& p : ops) cout << p.first << ' ' << p.second << '\n';
}
```

:::

### Grid Puzzle I


**题目大意**：$n\times n$ 的网格（$n\le100$），要求第 `i` 行恰好选 $a_i$ 个格子、第 `j` 列恰好选 $b_j$ 个格子（输入保证 $\sum_i a_i=\sum_j b_j$）。输出一种选择方案：`X` 表示选中、`.` 表示不选；不存在方案则输出 -1。

**解题思路**：把行按需求 $a_i$ 降序处理，每行一次性选中"当前剩余需求最大"的 $a_i$ 个列——`multiset` 以 $-b_j$ 为关键字维护各列剩余需求，取最小即取需求最大的列；被选中的列需求减 1 后放回。若某行可取的非空列不足 $a_i$ 个，则输出 -1。优先消耗需求大的列，是为了避免把列需求切得太碎、后面凑不齐。

- **正确性**：这是 Havel–Hakimi 型的交换论证——若存在满足行列和的 0-1 矩阵，则让需求最大的行占用需求最大的若干列之后仍然可行（把该行占用的较小列与另一行的较大列对调即可），故按"行降序、每次取最大列"贪心要么完整构造出方案、要么确实无解；该贪心成功与否恰好对应 0-1 矩阵行列和序列的 Gale–Ryser 可行性条件。总时间复杂度为 $O(n^2\log n)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    ll sa = 0, sb = 0;
    for (auto& v : a) {
        cin >> v;
        sa += v;
    }
    for (auto& v : b) {
        cin >> v;
        sb += v;
    }
    if (sa != sb) {
        cout << -1 << '\n';
        return;
    }
    vector<string> g(n, string(n, '.'));
    vector<int> rowOrder(n);
    iota(rowOrder.begin(), rowOrder.end(), 0);
    sort(rowOrder.begin(), rowOrder.end(),
         [&](int u, int v) { return a[u] > a[v]; });
    multiset<pair<int, int>> cols;
    for (int j = 0; j < n; j++)
        if (b[j] > 0)
            cols.insert({-b[j], j});
    for (int i : rowOrder) {
        vector<pair<int, int>> picked;
        for (int t = 0; t < a[i]; t++) {
            if (cols.empty()) {
                cout << -1 << '\n';
                return;
            }
            picked.push_back(*cols.begin());
            cols.erase(cols.begin());
        }
        for (auto& [neg, j] : picked) {
            g[i][j] = 'X';
            if (-neg > 1)
                cols.insert({neg + 1, j});
        }
    }
    for (auto& s : g) cout << s << '\n';
}
```

:::

### Grid Puzzle II


**题目大意**：$n\times n$ 的网格（$n\le50$），要求第 `i` 行恰好选 $a_i$ 个格子、第 `j` 列恰好选 $b_j$ 个格子（输入保证 $\sum_i a_i=\sum_j b_j$），并且格子 `(i, j)` 上有硬币数 $c_{ij}$。求所选格子的硬币总数最大值并输出方案（`X` 选中、`.` 不选），无可行方案输出 -1。

**解题思路**：

- **观察**：这是"每格 0/1、行列和固定"的选择问题，可以建成最小费用最大流：源 → 行 `i`（容量 $a_i$、费用 0）；行 `i` → 列 `j`（容量 1、费用 $-c_{ij}$，容量 1 保证每格至多选一次）；列 `j` → 汇（容量 $b_j$、费用 0）。

- **做法**：发送 $\sum_i a_i$ 单位流的最小费用取负即最大硬币数——每条行 → 列边被用满就代表选中该格，费用之和恰为 $-\sum c_{ij}$。若流不满 $\sum_i a_i$，说明行列和无法同时被满足，输出 -1。增广用 SPFA 逐次找最便宜路径（$n\le50$ 时规模足够）。输出方案时，行 → 列边容量被用尽（`cap == 0`）即该格入选，代码用 `ei % 2 == 0` 挑出正向边。

- **边界**：输入保证 $\sum a_i=\sum b_j$，故"每个行边满载"与"每个列边满载"等价，"流满 $\sum a_i$"就是可行性的判据；$c_{ij}$ 为 0 的格子被选中不影响费用，判断方案时同样按容量判定。

- **正确性**：任意合法选择方案对应一个满流且费用为其硬币数的相反数；反之任一满流按"行—列边是否用满"给出的选择满足每行 $a_i$、每列 $b_j$、每格至多一次，故最小费用的相反数就是最大硬币数。总时间复杂度为 $O(VEF)$（$V=2n+2$、$E=O(n^2)$、$F=\sum_i a_i$），空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        sum += a[i];
    }
    for (int i = 0; i < n; i++) cin >> b[i];
    vector<vector<int>> c(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> c[i][j];
    int N = 2 + 2 * n;
    int src = 0, sink = 1;
    auto row = [&](int i) { return 2 + i; };
    auto col = [&](int j) { return 2 + n + j; };
    struct E {
        int to, cap, cost;
    };
    vector<vector<int>> g(N);
    vector<E> edges;
    auto add = [&](int u, int v, int cap, int cost) {
        g[u].push_back(edges.size());
        edges.push_back({v, cap, cost});
        g[v].push_back(edges.size());
        edges.push_back({u, 0, -cost});
    };
    for (int i = 0; i < n; i++) add(src, row(i), a[i], 0);
    for (int j = 0; j < n; j++) add(col(j), sink, b[j], 0);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) add(row(i), col(j), 1, -c[i][j]);
    int flow = 0, cost = 0;
    while (flow < sum) {
        vector<int> dist(N, 1e9), pe(N, -1), pv(N, -1), inq(N, 0);
        queue<int> q;
        dist[src] = 0;
        q.push(src);
        inq[src] = 1;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            inq[u] = 0;
            for (int ei : g[u]) {
                auto& e = edges[ei];
                if (e.cap > 0 && dist[e.to] > dist[u] + e.cost) {
                    dist[e.to] = dist[u] + e.cost;
                    pv[e.to] = u;
                    pe[e.to] = ei;
                    if (!inq[e.to]) {
                        q.push(e.to);
                        inq[e.to] = 1;
                    }
                }
            }
        }
        if (dist[sink] == 1e9)
            break;
        int f = sum - flow;
        for (int v = sink; v != src; v = pv[v]) f = min(f, edges[pe[v]].cap);
        for (int v = sink; v != src; v = pv[v]) {
            edges[pe[v]].cap -= f;
            edges[pe[v] ^ 1].cap += f;
        }
        flow += f;
        cost += f * dist[sink];
    }
    if (flow < sum) {
        cout << -1 << '\n';
        return;
    }
    cout << -cost << '\n';
    for (int i = 0; i < n; i++) {
        string s(n, '.');
        for (int ei : g[row(i)])
            if (ei % 2 == 0 && edges[ei].to >= 2 + n && edges[ei].cap == 0)
                s[edges[ei].to - (2 + n)] = 'X';
        cout << s << '\n';
    }
}
```

:::

### Bit Substrings


**题目大意**：给一个长度为 `n` 的 01 串（$n\le2\times10^5$），对每个 `k = 0..n` 统计恰好含 `k` 个 1 的非空子串数量，依次输出 $n+1$ 个数。

**解题思路**：

- **观察**：设 1 出现的位置为 $p_1<\dots<p_m$，并补哨兵 $p_0=0$、$p_{m+1}=n+1$，记相邻位置差 $d_i=p_{i+1}-p_i$（$i=0..m$）。恰含 `k` 个 1 的子串，其第一个 1 必是某个 $p_i$、最后一个 1 必是 $p_{i+k-1}$：左端点可在 $p_{i-1}+1$ 到 $p_i$ 之间选，共 $d_{i-1}$ 种；右端点可在 $p_{i+k-1}$ 到 $p_{i+k}-1$ 之间选，共 $d_{i+k-1}$ 种。两类选择相互独立，故这类子串共有 $d_{i-1}\cdot d_{i+k-1}$ 个；对所有 `i` 求和并把下标平移一位，即 $ans[k]=\sum_j d_j\cdot d_{j+k}$——这正是数组 `d` 的**自相关**，用一次卷积即可全部求出。

- **做法**：把 `d` 与反转后的 `d` 作 FFT 卷积（`convolution`），`ans[k]`（$k\ge1$）就是卷积结果中下标为 $m-1-k$ 的那一项：$conv[m-1-k]=\sum_j d_j\cdot d_{k+j}$。`k=0` 不能套用（"以某个 1 开头"的前提不成立），单独统计：每一段连续 0 的长度为 `z` 时贡献 $z(z+1)/2$ 个子串，代码在扫描中把各段累加进 `ans[0]`。

- **边界**：全 0 串（`m = 0`）时 `d` 只有一项，`ans[k]`（$k\ge1$）全为 0、答案全部落在 `ans[0]`；卷积长度取不小于 $2m-1$ 的 2 的幂，$n\le2\times10^5$ 时答案不超过 $4\times10^{10}$，双精度浮点（配合 `llround` 取整）足够精确。

- **正确性**：每个恰含 `k` 个 1 的子串由其首、尾两个 1 唯一确定（`k\ge1`），左右端点的可选位置数分别是 $d_{i-1}$、$d_{i+k-1}$，乘积求和即精确计数；`k=0` 的子串恰为各 0 段内的子串，单独统计不重不漏。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
using cd = complex<double>;
const double PI = acos(-1);
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
        double ang = 2 * PI / len * (invert ? -1 : 1);
        cd wlen(cos(ang), sin(ang));
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
        for (auto& x : a) x /= n;
}
vector<ll> convolution(vector<ll> a, vector<ll> b) {
    int n = 1;
    while (n < (int)(a.size() + b.size())) n <<= 1;
    vector<cd> fa(n), fb(n);
    for (int i = 0; i < (int)a.size(); i++) fa[i] = a[i];
    for (int i = 0; i < (int)b.size(); i++) fb[i] = b[i];
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<ll> res(a.size() + b.size() - 1);
    for (int i = 0; i < (int)res.size(); i++) res[i] = llround(fa[i].real());
    return res;
}
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    vector<ll> pos;
    pos.push_back(0);
    for (int i = 0; i < n; i++)
        if (s[i] == '1')
            pos.push_back(i + 1);
    pos.push_back(n + 1);
    int m = pos.size() - 1;
    vector<ll> d(m);
    for (int i = 0; i < m; i++) d[i] = pos[i + 1] - pos[i];
    vector<ll> rev = d;
    reverse(rev.begin(), rev.end());
    vector<ll> conv = convolution(d, rev);
    vector<ll> ans(n + 1, 0);
    for (int k = 1; k < m; k++) ans[k] = conv[m - 1 - k];
    ll z = 0;
    for (char ch : s) {
        if (ch == '0')
            z++;
        else {
            ans[0] += z * (z + 1) / 2;
            z = 0;
        }
    }
    ans[0] += z * (z + 1) / 2;
    for (int k = 0; k <= n; k++) cout << ans[k] << ' ';
    cout << '\n';
}
```

:::

### Reversal Sorting


**题目大意**：给一个 $1..n$ 的排列（$n\le10^5$），每次操作可以反转一个子数组；要求把排列排成升序且操作次数不超过 `n`，输出方案：第一行是操作次数，随后每行 `l r` 表示反转区间 $[l, r]$。

**解题思路**：逐个把值归位。对 $v=1,2,\dots,n$，用位置数组 `pos` 查出 `v` 当前所在下标 `r = pos[v]`；若 `r > v`，就反转区间 $[v, r]$——反转会把区间右端点处的 `v` 换到下标 `v`，正好归位；`r = v` 时跳过。反转过程中同步把区间内每个元素的新下标写回 `pos`。每个值至多被归位一次，故操作次数不超过 $n$。但**时间复杂度是 $O(n^2)$**（瓶颈是每次反转都要线性回写 `pos`）：最坏的总反转长度约为 $n^2/4$（如 `2 4 6 … n … 5 3 1` 这类排列），$n = 2\times10^5$ 时约 $10^{10}$ 次操作，**必然超时**。要过本题得把区间反转换成带懒标记的隐式 treap / splay，把一次反转做到 $O(\log n)$；下面的代码只在 $n \lesssim 3000$ 时可用。空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> pos(n + 1), a(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        pos[a[i]] = i;
    }
    vector<pair<int, int>> ops;
    for (int v = 1; v <= n; v++) {
        int l = v, r = pos[v];
        if (l < r) {
            ops.push_back({l, r});
            while (l < r) {
                int lv = a[l], rv = a[r];
                a[l] = rv;
                a[r] = lv;
                pos[rv] = l;
                pos[lv] = r;
                l++;
                r--;
            }
        }
    }
    cout << ops.size() << '\n';
    for (auto& p : ops) cout << p.first << ' ' << p.second << '\n';
}
```

:::

### Book Shop II


**题目大意**：每本书有价格 $h_i$、页数 $s_i$、库存 $k_i$ 本（$n\le100$，预算 $x\le10^5$），在预算内求能买到的最大总页数，输出这个页数。

**解题思路**：多重背包。先用**二进制拆分**把每本书的 $k$ 个副本打包成若干件 0/1 物品：依次取出 $1,2,4,8,\dots$ 个副本作为一件（重量 = 份数 $\times h$、价值 = 份数 $\times s$），直到剩余副本不足下一个 2 的幂，再把剩余部分单独打包；然后按重量倒序做普通 0/1 背包，`dp[x]` 即答案。

- **正确性**：把 `k` 拆成 $1,2,4,\dots$ 与余数后，$0..k$ 之间任意副本数都能表示为其中若干份之和（二进制唯一表示），故拆分后的 0/1 背包与原多重背包完全等价；倒序遍历保证每件物品至多被选一次。总时间复杂度为 $O(x\sum_i\log k_i)$，空间复杂度为 $O(x)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, x;
    cin >> n >> x;
    vector<ll> w, v;
    vector<ll> H(n), S(n), K(n);
    for (int i = 1; i <= n; i++) cin >> H[i - 1];
    for (int i = 1; i <= n; i++) cin >> S[i - 1];
    for (int i = 1; i <= n; i++) cin >> K[i - 1];

    for (int i = 1; i <= n; i++) {
        ll h = H[i - 1], s = S[i - 1], k = K[i - 1];
        for (int j = 0; j <= 30; j++) {
            ll pw = 1 << j;
            if (k >= (pw)) {
                k -= pw;
                w.emplace_back(pw * h);
                v.emplace_back(pw * s);
            } else {
                w.emplace_back(k * h);
                v.emplace_back(k * s);
                break;
            }
        }
    }
    int cnt = w.size();
    vector<ll> dp(x + 1, 0);
    for (int i = 0; i <= cnt - 1; i++) {
        for (int j = x; j >= w[i]; j--) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    cout << dp[x] << '\n';
}
```

:::

### GCD Subsets


**题目大意**：给 `n` 个数，每个数都不超过 `n`；对每个 $k=1..n$ 统计"最大公约数恰好为 `k`"的非空子集个数，对 $10^9+7$ 取模后依次输出。

**解题思路**：

- **观察**：对每个 `d`，先用调和级数枚举统计 $c(d)$ = 能被 `d` 整除的元素个数，则"元素全是 `d` 的倍数"的非空子集有 $2^{c(d)}-1$ 个，记作 `cnt[d]`；这些子集的 gcd 都是 `d` 的倍数。设 `ans[d]` 为 gcd 恰好为 `d` 的非空子集个数，则 $cnt[d]=\sum_{m: d\mid m}ans[m]$——每个子集按"实际 gcd"唯一归入某一项。

- **做法**：从大到小反演：`ans[d] = cnt[d] - Σ ans[m]`，其中 `m` 取遍 $2d,3d,\dots$ 不超过 `n` 的倍数（同样是调和级数的枚举量）。做减法时先加模数再取模（`(g - ans[m] + MOD) % MOD`），避免出现负数。

- **边界**：`c(d) = 0` 时 `cnt[d] = 0`（空集不计数，$2^0-1=0$）；$2$ 的幂要预处理到 $2^n$（最多 `n` 个元素同时被 `d` 整除）；答案按 `d = 1..n` 顺序输出。

- **正确性**：每个"元素全为 `d` 的倍数"的非空子集按自身 gcd 分组后，恰好落入某个 `d` 的倍数 $m$ 的 `ans[m]` 中，故求和等式成立；从大到小逐一反演即可唯一确定每个 `ans[d]`。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n;
    cin >> n;
    vector<ll> pw(n + 1, 1);
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * 2 % MOD;
    vector<int> freq(n + 1, 0);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        freq[x]++;
    }
    vector<ll> cnt(n + 1, 0), ans(n + 1, 0);
    for (int d = 1; d <= n; d++) {
        ll c = 0;
        for (int m = d; m <= n; m += d) c += freq[m];
        cnt[d] = (pw[c] - 1 + MOD) % MOD;
    }
    for (int d = n; d >= 1; d--) {
        ll g = cnt[d];
        for (int m = 2 * d; m <= n; m += d) g = (g - ans[m] + MOD) % MOD;
        ans[d] = g;
    }
    for (int d = 1; d <= n; d++) cout << ans[d] << ' ';
    cout << '\n';
}
```

:::

### Minimum Cost Pairs


**解题思路**：

- **观察**：排序后每对在“剩余未配元素”里相邻是一种最优形态：设 $a\le b\le c\le d$ 而某方案把 $(a,d)$、$(b,c)$ 配成一对对，则换成 $(a,b)$、$(c,d)$ 代价不增（$(d-a)+(c-b)\ge(b-a)+(d-c)$），反复调整即可让每对都由相邻元素构成。于是所有候选都能看成「相邻两元素之间的边」，而配 $k$ 对的答案就是这组边里选 $k$ 条互不冲突者的最小权和。

- **做法**：把“当前相邻的两个元素”作为候选对：双向链表 `L`/`R` 维护相邻关系（位置 `1..n` 对应排序后的元素，`0` 与 `n+1` 是哨兵），`val[p] = b[R[p]] - b[p]` 记录把位置 `p` 与其右邻配成一对的代价，小根堆按 `val` 排序。每轮取出堆中未失效的最小 `val[p]`，累加进 `total` 并输出——第 `k` 轮的 `total` 就是配 `k` 对的答案。

- **反悔项**：取走这一对之后**不是简单删掉两端**，而是让 `p` 变成“撤销这次配对、改配左右两侧”的候选：`val[p] = val[L[p]] + val[R[p]] - val[p]`，再把 `L[p]`、`R[p]` 标记删除（`removed`），并把 `p` 接到 `L[L[p]]` 与 `R[R[p]]` 之间。这样堆里同时保存着「新配一对相邻元素」与「撤销已有配对、改配两侧」两类候选，每轮弹出的就是当前可行的最小增量。

- **正确性**：每一步弹出的都是所有可行增量的最小值，而反悔项恰好把「相邻配对」的局部贪心补成完备的增量集合（配对方案在增删后仍能用链表表示），因此第 `k` 次弹出后的 `total` 正是配 `k` 对的最小总代价。

- **边界**：堆中会残留失效项，弹出前先用 `removed[p]` 与“堆顶代价是否仍等于 `val[p]`”两道检查跳过；`val` 用 $2^{60}$ 作哨兵，使“与不存在的元素配对”永远不会被选中。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    sort(a.begin(), a.end());

    // 位置 1..n 对应 a[0..n-1]；0 与 n+1 是哨兵，配不上任何东西
    const ll BIG = (1LL << 60);
    int N = n + 2;
    vector<ll> b(N, BIG);
    for (int i = 0; i < n; i++) b[i + 1] = a[i];
    vector<int> L(N), R(N);
    vector<ll> val(N, BIG);
    vector<char> removed(N, 0);
    for (int p = 0; p < N; p++) L[p] = p - 1, R[p] = p + 1;
    L[0] = 0, R[n + 1] = n + 1;
    for (int p = 1; p <= n - 1; p++) val[p] = b[p + 1] - b[p];

    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<pair<ll, int>>> pq;
    for (int p = 1; p <= n - 1; p++) pq.push({val[p], p});

    ll total = 0;
    for (int k = 1; k <= n / 2; k++) {
        while (true) {
            auto [d, p] = pq.top();
            if (!removed[p] && d == val[p])
                break;
            pq.pop();
        }
        auto [d, p] = pq.top();
        pq.pop();
        total += d;
        cout << total << ' ';

        int l = L[p], r = R[p];
        // 反悔项：撤销这次 (p, r) 配对，改配 (l, p) 与 (r, R[r])，代价变化 val[l] + val[r] - val[p]
        val[p] = (l >= 1 && r <= n) ? val[l] + val[r] - val[p] : BIG;
        removed[l] = removed[r] = 1;
        int nl = L[l], nr = R[r];
        L[p] = nl, R[p] = nr;
        R[nl] = p, L[nr] = p;
        if (val[p] < BIG)
            pq.push({val[p], p});
    }
    cout << '\n';
}
```

:::

### Same Sum Subsets

**题目大意**：给 `n` 个正整数（$n \le 40$），求两个**不相交**的子集使它们的和相等，输出这两个子集（先输出大小再输出元素）；题目保证有解。

**解题思路**：

- **观察**：非空子集共 $2^n-1$ 个，而每个和都落在 $[1, \sum x_i] \subseteq [1, 2^n-2]$ 内，由鸽巢原理必有两个不同子集同和——题目给的 $\sum x_i \le 2^n-2$ 正是为此。又若 $A \ne B$ 同和，则 $A \setminus B$ 与 $B \setminus A$ 不交、和相等，且两者都非空（若一边为空则另一边之和为 $0$，与所有 $x_i > 0$ 矛盾），所以只需求出任意两个不同子集的同和，最后各自减去交集即可。

- **做法**：把下标平分成两半，各不超过 $20$ 个，枚举每半的全部子集和并排序（每半 $2^{20}$ 个）。记 `g(x)` 为和不超过 $x$ 的**全体**子集个数（含空集），用双指针在 $O(2^{n/2})$ 内求出。在 $[1, 2^n-2]$ 上二分最小的满足 `g(x) - 1 > x` 的 $x$，其中减一是扣掉空集。定出 $x$ 之后，用一张「右半和 $\to$ 至多两个右半掩码」的哈希表扫左半掩码，凑出两个不同的完整子集；两个掩码各自减去交集即为答案。

- **正确性**：令 $f(x) = g(x) - 1$ 表示非空子集中和不超过 $x$ 的个数，则 $f$ 单调不减，且 $f(2^n-2) = 2^n-1 > 2^n-2$，故满足 $f(x) > x$ 的 $x$ 必定存在。又只要某处有 $f(x) \ge x+1$ 且 $f(x-1) \le x-1$，就有 $f(x) - f(x-1) \ge 2$，而 $f(x) - f(x-1)$ 恰是和等于 $x$ 的子集个数，于是至少有两个子集同和。代码二分出这样的 $x$ 后逐个向下确认该和的表示数，凑出两个不同掩码，再把它们各自减去交集，得到的就是两个不交、非空、等和的子集。

- **边界**：每一半至多 $20$ 个下标，$n$ 为奇数时两半大小差 $1$；和最大约 $2^{40}$，故 `ans` 与 `g` 的返回值都必须用 64 位；题目保证有解，`IMPOSSIBLE` 分支实际不会触发。总时间复杂度为 $O(n 2^{n/2})$，空间复杂度为 $O(2^{n/2})$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    cin >> n;
    vector<ll> x(n);
    for (auto &v : x)
        cin >> v;
    int n1 = n / 2, n2 = n - n1, N1 = 1 << n1, N2 = 1 << n2;
    vector<ll> A(N1), B(N2);
    A[0] = 0;
    for (int m = 1; m < N1; m++)
    {
        int b = __builtin_ctz(m);
        A[m] = A[m ^ (1 << b)] + x[b];
    }
    B[0] = 0;
    for (int m = 1; m < N2; m++)
    {
        int b = __builtin_ctz(m);
        B[m] = B[m ^ (1 << b)] + x[n1 + b];
    }
    auto radix = [&](vector<ll> &v)
    {
        size_t len = v.size();
        vector<ll> tmp(len);
        vector<int> cnt(65536);
        for (int pass = 0; pass < 3; pass++)
        {
            int shift = pass * 16;
            fill(cnt.begin(), cnt.end(), 0);
            for (size_t i = 0; i < len; i++)
                cnt[(v[i] >> shift) & 0xFFFF]++;
            int s = 0;
            for (int d = 0; d < 65536; d++)
            {
                int c = cnt[d];
                cnt[d] = s;
                s += c;
            }
            for (size_t i = 0; i < len; i++)
                tmp[cnt[(v[i] >> shift) & 0xFFFF]++] = v[i];
            v.swap(tmp);
        }
    };
    vector<ll> s1(A), s2(B);
    radix(s1);
    radix(s2);
    auto g = [&](ll v) -> ll
    {
        ll acc = 0;
        int t1 = 0;
        for (int t2 = N2 - 1; t2 >= 0; --t2)
        {
            ll lim = v - s2[t2];
            while (t1 < N1 && s1[t1] <= lim)
                ++t1;
            acc += t1;
        }
        return acc;
    };
    ll hi = 0;
    for (auto v : x)
        hi += v;
    ll lo = 1, ans = -1;
    while (lo <= hi)
    {
        ll mid = lo + (hi - lo) / 2;
        if (g(mid) - 1 > mid)
        {
            ans = mid;
            hi = mid - 1;
        }
        else
            lo = mid + 1;
    }
    if (ans < 0)
    {
        cout << "IMPOSSIBLE" << '\n';
        return;
    }
    size_t cap = 1;
    while (cap < (size_t)N2 * 2)
        cap <<= 1;
    size_t msk = cap - 1;
    vector<ll> key(cap, -1);
    vector<int> h1(cap, -1), h2(cap, -1);
    auto hf = [&](ll v) -> size_t
    {
        ull z = (ull)v;
        z ^= z >> 33;
        z *= 0xff51afd7ed558ccdULL;
        z ^= z >> 33;
        return (size_t)z;
    };
    for (int m = 0; m < N2; m++)
    {
        ll k = B[m];
        size_t i = hf(k) & msk;
        while (key[i] != -1 && key[i] != k)
            i = (i + 1) & msk;
        if (key[i] == -1)
        {
            key[i] = k;
            h1[i] = m;
        }
        else if (h1[i] != m && h2[i] == -1)
            h2[i] = m;
    }
    auto find2 = [&](ll target, ull &ma, ull &mb) -> bool
    {
        int found = 0;
        for (int i = 0; i < N1 && found < 2; i++)
        {
            ll need = target - A[i];
            if (need < 0)
                continue;
            size_t p = hf(need) & msk;
            while (key[p] != -1 && key[p] != need)
                p = (p + 1) & msk;
            if (key[p] == -1)
                continue;
            int r = h1[p];
            ull full = (ull)i | ((ull)r << n1);
            if (found == 0)
            {
                ma = full;
                found = 1;
            }
            else if (full != ma)
            {
                mb = full;
                return true;
            }
            r = h2[p];
            if (r >= 0)
            {
                full = (ull)i | ((ull)r << n1);
                if (full != ma)
                {
                    mb = full;
                    return true;
                }
            }
        }
        return found == 2;
    };
    ull P = 0, Q = 0;
    bool got = false;
    for (ll v = ans; v >= 1 && v >= ans - 64 && !got; v--)
        got = find2(v, P, Q);
    if (!got)
    {
        cout << "IMPOSSIBLE" << '\n';
        return;
    }
    ull a1 = P & ~Q, b1 = Q & ~P;
    vector<ll> v1, v2;
    for (int i = 0; i < n; i++)
        if (a1 >> i & 1)
            v1.push_back(x[i]);
    for (int i = 0; i < n; i++)
        if (b1 >> i & 1)
            v2.push_back(x[i]);
    if (v1.empty() || v2.empty())
    {
        cout << "IMPOSSIBLE" << '\n';
        return;
    }
    cout << v1.size() << '\n';
    for (size_t i = 0; i < v1.size(); i++)
    {
        if (i)
            cout << ' ';
        cout << v1[i];
    }
    cout << '\n';
    cout << v2.size() << '\n';
    for (size_t i = 0; i < v2.size(); i++)
    {
        if (i)
            cout << ' ';
        cout << v2[i];
    }
    cout << '\n';
}
```

:::

### Mex Grid Queries


**题目大意**：共 `t` 组询问，每组给出 `y`、`x` 查询一个格子的值。被查询的网格按如下规则构造：格子 `(y, x)`（行列编号从 1 开始）的值定义为"它在同一行左侧以及同一列上方的所有值中都未出现过的最小非负整数"；第一行与第一列由该规则依次得到 $0,1,2,\dots$。

**解题思路**：

- **观察**：规则即 $a_{y,x}=\operatorname{mex}\big(\{a_{y,j}:j<x\}\cup\{a_{i,x}:i<y\}\big)$。对网格位置归纳可以验证封闭形式 $a_{y,x}=(y-1)\oplus(x-1)$（按位异或）。

- **正确性**：记 $A=y-1$、$B=x-1$，只需验证两件事。(1) $A\oplus B$ 不在上述集合中：集合由 $\{A\oplus j:j<B\}$ 与 $\{i\oplus B:i<A\}$ 组成，若 $A\oplus B=i\oplus B$ 则 $i=A$，若 $A\oplus B=A\oplus j$ 则 $j=B$，都与取值范围矛盾。(2) 每个 $v<A\oplus B$ 都在集合中：取 `v` 与 $A\oplus B$ 从高位起第一个不同的二进制位 `b`，该位上 $A\oplus B$ 为 1、`v` 为 0；若 `B` 的第 `b` 位是 0（于是 `A` 该位为 1），则 $v\oplus B$ 在高于 `b` 的位上与 `A` 相同、第 `b` 位为 0，故 $v\oplus B<A$，即 $v=(v\oplus B)\oplus B$ 出现在"上方同列"部分；若 `B` 的第 `b` 位是 1（于是 `A` 该位为 0），同理 $v\oplus A<B$，$v=A\oplus(v\oplus A)$ 出现在"左侧同行"部分。两件事合起来说明该格的 mex 恰为 $A\oplus B$。

- **做法**：每组询问直接输出 `(y - 1) ^ (x - 1)`，无需真的构造网格。每组的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve()
{
    ll y, x;
    cin >> y >> x;
    cout << ((y - 1) ^ (x - 1)) << '\n';
}
```

:::

### Maximum Building II


**题目大意**：$n\times m$ 的森林地图（`.` 是空地、`*` 是树，$n,m\le1000$），对每种尺寸 $h\times w$（$1\le h\le n$、$1\le w\le m$）统计"边界与内部都不含树、行数恰为 `h`、列数恰为 `w`"的矩形个数，按 `h` 递增、同一 `h` 内 `w` 递增的顺序输出 $n\times m$ 个数。

**解题思路**：

- **观察**：让每一行充当矩形的下边界，`up[j]` 表示第 `j` 列向上连续空地的行数。用单调栈扫描这一行（栈内按高度递增）：当高度为 `h`、累计宽度为 `w` 的块被弹出时，`w` 这个宽度在高度区间 $(lo,\ h]$ 上都成立，其中 `lo` 是弹出后栈顶高度与当前 `up[j]` 的较大者——也就是说"宽 `w`、高 $h'\in(lo,h]$、以当前行为底"的矩形（每行有 `w` 种左端位置）恰好在此刻被完整统计一次，于是用高度维差分记录：`diff[lo + 1][w] += 1`、`diff[h + 1][w] -= 1`。

- **做法**：沿高度做前缀和得到 `cnt[h][w]` = "高度为 `h` 的 run 中出现过宽度 `w`"的计数；宽度为 `W` 的 run 内部可以框出 $W-w+1$ 个宽 `w` 的子矩形，故 $ans[h][w]=\sum_{W\ge w}(W-w+1)\cdot cnt[h][W]$。代码对每个 `h` 从大到小扫 `w`，用 `s1 += (w + 1) * cnt[h][w]`、`s2 += cnt[h][w]` 维护两个后缀和，`ans[h][w] = s1 - w * s2`。

- **边界**：扫描到 `j = m` 时补一个高度为 0 的哨兵，把栈内剩余块全部弹出（`wNew` 置 0，不引入新列）；`diff` 的高度方向开 $n+2$ 行以容纳 `h + 1` 的差分端点。

- **正确性**：每个不含树、以当前行为底的"高 `h`、宽 `w`"的极大 run 恰在栈弹出对应块时被记录一次，故 `cnt` 不重不漏；再由"run 内平移"的组合数得到各尺寸矩形的总数。总时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (auto& s : g) cin >> s;

    vector<vector<ll>> diff(n + 2, vector<ll>(m + 1, 0));
    vector<int> up(m, 0);
    for (int r = 0; r < n; r++) {
        for (int j = 0; j < m; j++) up[j] = g[r][j] == '.' ? up[j] + 1 : 0;
        vector<pair<int, int>> st;
        for (int j = 0; j <= m; j++) {
            int u = j < m ? up[j] : 0;
            int wNew = j < m ? 1 : 0;
            int w = 0;
            while (!st.empty() && st.back().first > u) {
                auto [h, cw] = st.back();
                st.pop_back();
                w += cw;
                int lo = max(u, st.empty() ? 0 : st.back().first);

                diff[lo + 1][w] += 1;
                diff[h + 1][w] -= 1;
                wNew += cw;
            }
            if (!st.empty() && st.back().first == u) {
                wNew += st.back().second;
                st.pop_back();
            }
            st.push_back({u, wNew});
        }
    }
    vector<vector<ll>> cnt(n + 1, vector<ll>(m + 1, 0));
    for (int w = 1; w <= m; w++) {
        ll acc = 0;
        for (int h = 1; h <= n; h++) {
            acc += diff[h][w];
            cnt[h][w] = acc;
        }
    }

    vector<vector<ll>> ans(n + 1, vector<ll>(m + 1, 0));
    for (int h = 1; h <= n; h++) {
        ll s1 = 0, s2 = 0;
        for (int w = m; w >= 1; w--) {
            s1 += (ll)(w + 1) * cnt[h][w];
            s2 += cnt[h][w];
            ans[h][w] = s1 - (ll)w * s2;
        }
    }
    for (int h = 1; h <= n; h++) {
        for (int w = 1; w <= m; w++) cout << ans[h][w] << (w == m ? '\n' : ' ');
    }
}
```

:::

### Stick Divisions


**题目大意**：把一根长度为 `x` 的木棍切成 `m` 段（各段长度在输入中给出，总和为 `x`）；每次切割的代价等于被切的那根木棍的当前长度，求最小总代价。

**解题思路**：反向看这个过程：从最终的 `m` 段出发，每次把两段**合并**成一段，合并的代价是两段长度之和。两者一一对应且总代价相同（把 `L` 切成两段的代价正是 $L$，对应合并时付出 $L$），于是问题变成"把 `m` 个数合并成一个"的最小代价——正是 Huffman 合并：用小根堆每次取出最短的两段合并、把代价累加并把新长度放回堆中，直到堆中只剩一段。时间复杂度为 $O(m\log m)$，空间复杂度为 $O(m)$。

:::details[题解(C++)]

```c++
void solve() {
    int x, m;
    cin >> x >> m;
    ll ans = 0;
    multiset<ll> s;
    for (int i = 0; i < m; i++) {
        ll v;
        cin >> v;
        s.insert(v);
    }
    while (s.size() >= 2) {
        auto a = *s.begin();
        s.erase(s.begin());
        auto b = *s.begin();
        s.erase(s.begin());
        ans += a + b;
        s.insert(a + b);
    }
    cout << ans << '\n';
}
```

:::

### Stick Difference


**题目大意**：有 $n$ 根棍子，长度 $a_1,\dots,a_n$。做**恰好** $k$ 次切割（每切一刀把一根棍子分成两段正整数长度），棍子数变为 $n+k$，要求切完后最长段与最短段之差尽量小。对 $k=1,2,\dots,m$ 分别输出这个最小差值。数据保证总长度足以切 $m$ 次。

**解题思路**：

- **转化**：只看"每根棍子切成几段"是不够的，还要能控制段长。设最终所有段都落在区间 $[L,M]$ 内（最短不超过 $L$、最长不超过 $M$），则长度为 $x$ 的棍子能被切成**恰好** $t$ 段且每段都落在 $[L,M]$ 内，当且仅当
  $$tL \le x \le tM.$$
  必要性显然；充分性：先把 $t$ 段都设成 $L$，再把剩下的 $x-tL$ 分摊到各段上，每段最多还能加 $M-L$，而 $x-tL\le t(M-L)$ 正好够分。
  于是对固定的 $(L,M)$，第 $i$ 根棍子允许的段数是区间
  $$\left[\left\lceil \frac{a_i}{M}\right\rceil,\ \left\lfloor \frac{a_i}{L}\right\rfloor\right],$$
  总段数 $S=n+k$ 可行当且仅当**每个区间都非空**、且 $S$ 落在这些区间之和里：
  $$\text{每个 } i:\ \left\lceil \frac{a_i}{M}\right\rceil \cdot L \le a_i,\qquad \sum_i\left\lceil \frac{a_i}{M}\right\rceil \le S \le \sum_i\left\lfloor \frac{a_i}{L}\right\rfloor .$$

- **坑点**：只验证右边的"段数区间"是不够的，必须同时保证每根棍子的段数区间非空。例如 $a=[16,40,16,20,11,23]$，取 $L=8,\ M=11$：$\sum\lceil a_i/11\rceil=14=S$，$\sum\lfloor a_i/8\rfloor=14\ge S$，右边完全成立；但 $23$ 这根棍子 $\lceil 23/11\rceil=3>\lfloor 23/8\rfloor=2$，区间是空的，它一根都切不出来，$S=14$ 实际取不到。漏掉这条就会在这一组数据上挂掉。

- **做法**：记
  $$G(M)=\sum_i\left\lceil\frac{a_i}{M}\right\rceil,\qquad H(L)=\sum_i\left\lfloor\frac{a_i}{L}\right\rfloor,\qquad \lambda(M)=\min_i\left\lfloor\frac{a_i}{\lceil a_i/M\rceil}\right\rfloor,$$
  则"每个区间非空"等价于 $L\le\lambda(M)$。答案就是
  $$\text{ans}(S)=\min_{M:\ G(M)\le S}\Big(M-\min\big(\lambda(M),\ B(S)\big)\Big),\qquad B(S)=\max\Big\{L\le\min_i a_i:\ H(L)\ge S\Big\}.$$
  $M-\min(\lambda(M),B(S))$ 的含义是：取最大段长为 $M$，则最短段最大能取到 $\lambda(M)$（受"每根都能切"限制）与 $B(S)$（受"段数够多"限制）的较小者。

- **实现**：$M_{\min}(S)=\min\{M:G(M)\le S\}$ 是 $G$ 的反函数，$B(S)$ 是 $H$ 的反函数 —— 两者都是"若干个 $\lfloor\cdot\rfloor$ 之和"的反函数，用整除分块的断点扫描可以在 $O((n+m)\log)$ 内对所有 $k$ 一次求出。$\lambda$ 单调不减，是个阶梯函数；它的平台左端点恰好是
  $$\mu(c)=\max_i\left\lceil\frac{a_i}{\lfloor a_i/c\rfloor}\right\rceil$$
  （因为 $\lambda(M)\ge c\iff M\ge\mu(c)$），且在 $M\ge M_{\min}(m)$ 之后平台总数是 $O(n+m)$。于是每个 $k$ 只需在平台上二分定位 + 稀疏表做一次区间最小值查询。

- **正确性**：段数与段长的可行性在上面已经等价转化；$(L,M)$ 可行时实际差值不超过 $M-L$，而最优解的（最短段, 最长段）本身就是一对可行 $(L,M)$，故取遍可行对的 $M-L$ 最小值即为答案。$\square$

- **复杂度**：时间复杂度为 $O\big((n+m)\log(n+m)\big)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int MAXN = 100005;
int n, m;
ll a[MAXN];
vector<int> MloK, BK;      // [1..m]：G 的反函数、B(S)
vector<ll> P, C;           // λ 的平台：左端点、取值

// Mlo[k] = 最小 M 使 sum floor((a_i-1)/M) <= k，即最小 M 使 G(M) <= n+k
void computeMlo()
{
    static ll b[MAXN];
    ll cap = 0;
    for (int i = 0; i < n; i++) b[i] = a[i] - 1, cap = max(cap, a[i]);
    auto at = [&](ll M) {
        ll s = 0;
        for (int i = 0; i < n; i++) s += b[i] / M;
        return s;
    };
    auto bin = [&](ll thr) {                  // 最小的 M 使 at(M) <= thr
        ll lo = 1, hi = cap + 1;
        while (lo < hi) {
            ll mid = (lo + hi) >> 1;
            if (at(mid) <= thr) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    };
    ll Mlo = bin(m), Mhi = bin(1);
    MloK.assign(m + 1, 0);
    vector<pair<ll, ll>> ev;
    for (int i = 0; i < n; i++) {
        ll x = b[i];
        if (x < Mlo) continue;
        for (ll t = 1; t <= x / Mlo; t++) {   // floor(x/M)=t 的 M 区间
            ll lo = x / (t + 1) + 1, hi = x / t;
            ll l = max(lo, Mlo), h = min(hi, Mhi);
            if (l <= h) {
                ev.push_back({l, t});
                ev.push_back({h + 1, -t});
            }
        }
    }
    ev.push_back({Mlo, 0});
    ev.push_back({Mhi + 1, 0});
    sort(ev.begin(), ev.end());
    ll cur = 0, prevV = LLONG_MAX;
    for (size_t i = 0; i < ev.size(); i++) {
        ll M = ev[i].first;
        if (M > Mhi) break;
        while (i < ev.size() && ev[i].first == M) cur += ev[i].second, i++;
        i--;
        ll kLo = max(cur, 1LL), kHi = min(prevV - 1, (ll)m);
        for (ll k = kLo; k <= kHi; k++) MloK[(int)k] = (int)M;
        prevV = min(prevV, cur);
    }
}

// B[k] = 最大 L <= min a_i 使 sum floor(a_i/L) - n >= k
void computeB()
{
    ll cap = 1e18;
    for (int i = 0; i < n; i++) cap = min(cap, a[i]);
    auto Q = [&](ll L) {
        ll s = 0;
        for (int i = 0; i < n; i++) s += a[i] / L;
        return s - n;
    };
    auto bin = [&](ll thr) {                  // 最大的 L <= cap 使 Q(L) >= thr
        ll lo = 1, hi = cap;
        while (lo < hi) {
            ll mid = (lo + hi + 1) >> 1;
            if (Q(mid) >= thr) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    };
    ll Llo = bin(m), Lhi = bin(1);
    BK.assign(m + 1, 1);
    ll lowFrom = Llo + 1;
    if (lowFrom <= Lhi) {
        vector<pair<ll, ll>> ev;
        for (int i = 0; i < n; i++) {
            ll x = a[i];
            ll tHi = x / lowFrom, tLo = max(1LL, x / Lhi);
            for (ll t = tHi; t >= tLo; t--) { // floor(x/L)=t 的 L 区间
                ll lo = x / (t + 1) + 1, hi = x / t;
                ll l = max(lo, lowFrom), h = min(hi, Lhi);
                if (l <= h) {
                    ev.push_back({l, t});
                    ev.push_back({h + 1, -t});
                }
            }
        }
        ev.push_back({lowFrom, 0});
        ev.push_back({Lhi + 1, 0});
        sort(ev.begin(), ev.end());
        vector<pair<ll, ll>> segs;
        ll cur = 0;
        for (size_t i = 0; i < ev.size(); i++) {
            ll L = ev[i].first;
            if (L > Lhi) break;
            while (i < ev.size() && ev[i].first == L) cur += ev[i].second, i++;
            i--;
            segs.push_back({L, cur - n});
        }
        int kNext = 1;
        for (int j = (int)segs.size() - 1; j >= 0 && kNext <= m; j--) {
            ll Rend = (j + 1 < (int)segs.size()) ? segs[j + 1].first - 1 : Lhi;
            int kTop = (int)min(segs[j].second, (ll)m);
            for (int k = kNext; k <= kTop; k++) BK[k] = (int)Rend;
            if (kTop >= kNext) kNext = kTop + 1;
        }
        for (int k = kNext; k <= m; k++) BK[k] = (int)Llo;
    } else {
        for (int k = 1; k <= m; k++) BK[k] = (int)Llo;
    }
    for (int k = 1; k <= m; k++) BK[k] = max(BK[k], 1);
}

// λ 的阶梯：左端点与取值
void computePlateaus(ll Mmin0, ll maxA)
{
    vector<array<ll, 3>> ev;      // M, +1/-1, 值
    for (int i = 0; i < n; i++) {
        ll x = a[i], V = (x + Mmin0 - 1) / Mmin0;
        for (ll v = 1; v <= V; v++) {
            ll lo = (v == 1) ? x : (x + v - 1) / v;
            ll hi = (v == 1) ? LLONG_MAX : (x - 1) / (v - 1);
            ll l = max(lo, Mmin0), h = min(hi, maxA);
            if (l <= h) {
                ll val = x / v;
                ev.push_back({l, 1, val});
                ev.push_back({h + 1, -1, val});
            }
        }
    }
    sort(ev.begin(), ev.end());
    multiset<ll> ms;
    vector<pair<ll, ll>> segs;
    for (size_t i = 0; i < ev.size(); i++) {
        ll M = ev[i][0];
        if (M > maxA) break;
        while (i < ev.size() && ev[i][0] == M) {
            if (ev[i][1] == 1) ms.insert(ev[i][2]);
            else ms.erase(ms.find(ev[i][2]));
            i++;
        }
        i--;
        if (!ms.empty()) segs.push_back({M, *ms.begin()});
    }
    P.clear(), C.clear();
    for (auto &s : segs) {
        if (!C.empty() && C.back() == s.second) continue;
        P.push_back(s.first), C.push_back(s.second);
    }
}

void solve()
{
    cin >> n >> m;
    for (int i = 0; i < n; i++) cin >> a[i];

    ll minA = *min_element(a, a + n), maxA = *max_element(a, a + n);
    computeMlo();
    computeB();
    computePlateaus(max(1LL, (ll)MloK[m]), maxA);

    int cnt = (int)P.size();
    vector<int> V(cnt);
    for (int j = 0; j < cnt; j++) V[j] = (int)(P[j] - C[j]);
    vector<ll> sufP(cnt + 1, LLONG_MAX);
    for (int j = cnt - 1; j >= 0; j--) sufP[j] = min(sufP[j + 1], P[j]);
    vector<vector<int>> sp;
    sp.push_back(V);
    for (int t = 1;; t++) {
        int shift = 1 << (t - 1), len = cnt - (1 << t) + 1;
        if (len <= 0) break;
        vector<int> cur(len);
        for (int j = 0; j < len; j++) cur[j] = min(sp[t - 1][j], sp[t - 1][j + shift]);
        sp.push_back(cur);
    }
    vector<int> lg(max(2, cnt + 1), 0);
    for (int i = 2; i <= cnt; i++) lg[i] = lg[i >> 1] + 1;
    auto rmq = [&](int l, int r) {
        if (l > r) return INT_MAX;
        int t = lg[r - l + 1];
        return min(sp[t][l], sp[t][r - (1 << t) + 1]);
    };

    for (int k = 1; k <= m; k++) {
        ll S = n + k;
        ll Mlo = MloK[k], B = max((ll)BK[k], 1LL);
        int j0 = lower_bound(P.begin(), P.end(), Mlo) - P.begin();
        int j1 = upper_bound(C.begin(), C.end(), B) - C.begin() - 1;
        ll best = LLONG_MAX;
        if (j1 >= j0) best = min(best, (ll)rmq(j0, j1));
        int from = max(j0, j1 + 1);
        if (from < cnt) best = min(best, sufP[from] - B);
        if (j0 >= 1 && (j0 >= cnt || P[j0] > Mlo))
            best = min(best, Mlo - min(C[j0 - 1], B));
        cout << best << " \n"[k == m];
    }
}
```

:::

---

### Coding Company


**题目大意**：把 `n` 个程序员分成若干组（$n\le100$），每组的总惩罚是该组内技能最大值与最小值之差，求总惩罚不超过 `x`（$x\le5000$）的分组方案数，对 $10^9+7$ 取模后输出。

**解题思路**：

- **观察**：把技能值排序后逐个处理。`dp[j][c]` 表示已处理若干人、当前有 `j` 支"已开未关"的队伍、累计惩罚为 `c` 的方案数；"开队"指该组已经开始、但最大值还没确定，"关队"指该组的最大值已经确定（后面不会再有更大的人加入组内）。排序后组内极差等于组内相邻两人技能差之和，因此处理第 `i` 个人时，差值 $gap=t_i-t_{i-1}$ 会分摊到当前所有未关闭的队伍上，代码在转移前统一做 `base = c + j * gap`。

- **做法**：每加入一个人有四种转移：新开一队（`j + 1`）；加入某支未关闭的队伍且暂不关闭（`j` 种选择、`j` 不变）；加入某支队伍并立即关闭（`j` 种选择、`j - 1`）；独自成组、开了又立刻关（`j` 不变，计入 `ndp[j][base]`）。答案 $=\sum_c dp[0][c]$，即所有队伍都已关闭。

- **边界**：`base > x` 的状态直接丢弃（惩罚只增不减，越界后不可能再回到 $\le x$）；`i = 1` 时 `gap = 0`；每种转移都要取模。

- **正确性**：排序使"组内极差 = 组内相邻差之和"，"未关闭队伍数"恰好刻画了当前 `gap` 需要计入几支队伍，四种转移对每个人的归属不重不漏，故 `dp[0][\cdot]` 之和就是总惩罚不超过 `x` 的分组方案数。总时间复杂度为 $O(n^2x)$，空间复杂度为 $O(nx)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n, x;
    cin >> n >> x;
    vector<int> t(n);
    for (auto& v : t) cin >> v;
    sort(t.begin(), t.end());

    vector<vector<ll>> dp(n + 1, vector<ll>(x + 1, 0));
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++) {
        vector<vector<ll>> ndp(n + 1, vector<ll>(x + 1, 0));
        int gap = i >= 2 ? t[i - 1] - t[i - 2] : 0;
        for (int j = 0; j <= n; j++) {
            for (int c = 0; c <= x; c++) {
                ll v = dp[j][c];
                if (!v)
                    continue;
                int base = c + j * gap;
                if (base > x)
                    continue;

                if (j + 1 <= n)
                    ndp[j + 1][base] = (ndp[j + 1][base] + v) % MOD;

                ndp[j][base] = (ndp[j][base] + v * j) % MOD;

                if (j >= 1)
                    ndp[j - 1][base] = (ndp[j - 1][base] + v * j) % MOD;

                ndp[j][base] = (ndp[j][base] + v) % MOD;
            }
        }
        dp = ndp;
    }
    ll ans = 0;
    for (int c = 0; c <= x; c++) ans = (ans + dp[0][c]) % MOD;
    cout << ans << '\n';
}
```

:::

### Two Stacks Sorting


**题目大意**：给一个 $1..n$ 的排列，把它依次送入两个栈（每个数是自己选择进哪个栈的），再从两个栈里弹出、要求最终输出 $1,2,\dots,n$ 的升序序列。输出每个数进入的栈号（按输入顺序，值为 1 或 2），无解输出 IMPOSSIBLE。

**解题思路**：

- **观察**：先刻画冲突。同一栈中先入者必在后入者下方，弹出顺序是后进先出；若 $i<j$ 且 $a_i<a_j$ 被分到同一个栈，则 $a_j$ 在 $a_i$ 上方、必须先弹出，与"升序输出"矛盾——唯一的挽救是让 $a_i$ 在 $a_j$ 入栈前就已被弹出，这要求所有小于 $a_i$ 的值都在第 `j` 个位置之前出现。因此 $a_i$ 与 $a_j$（$i<j$、$a_i<a_j$）不能同栈，当且仅当存在 $k>j$ 使 $a_k<a_i$，也就是三下标 $i<j<k$ 上的值呈 $a_k<a_i<a_j$ 的 231 形状；而值递减的同栈对永远相容（后入者更小、可以立刻弹出）。于是双栈可行等价于"按 231 冲突连边的图可二染色"。

- **做法**：把冲突边批量化。读入值 `x` 时记录它的到达序号 `st[x]`，并维护"下一个待输出的值" `nx`：每当 `nx` 已经出现过，就为一个新块记录区间 $[st[nx],\ \text{当前时刻}]$ 存进 `w`——两个块相交当且仅当对应的值构成 231 冲突。块按起点排序后依次处理，用线段树按块的终点挂上"已处理块的起点"：`query(a, b)` 收集与当前块 $[a,b]$ 相交的全部已处理块，把它们与当前块连成"必须异色"的约束——并查集负责合并"必须同色"的块，`edge` 数组记录每个分量的异色对象；若某一刻发现两个必须异色的块已经在同一分量（冲突图出现奇环），就输出 IMPOSSIBLE。

- **边界**：`query` 内对每个线段树结点只从上次的位置继续扫描（结点上的 `k` 指针），使总代价为 $O(\log n)$ 摊还；全部块处理完后按 `edge` 关系给每个分量染色（先遇到的分量取 1、其异色对象取 2），再按块（即按输入顺序）输出每个数所在栈号。

- **正确性**：块相交与 231 冲突一一对应，"同色 = 同栈"的约束由并查集与 `edge` 完整记录；无奇环时按分量交替染色即得到合法分栈方案，有奇环时任何分法都会产生同栈冲突，故输出 IMPOSSIBLE 正确。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int M = 1 << 19;
int edge[M];
int color[M];
struct dsu {
    int parent, size;
} d[M];

int find(int a) {
    if (a == -1)
        return a;
    if (d[a].parent == a)
        return a;
    d[a].parent = find(d[a].parent);
    return d[a].parent;
}
int unite(int a, int b) {
    if (a == -1)
        return find(b);
    if (b == -1)
        return find(a);
    int A = find(a);
    int B = find(b);
    if (A == B)
        return A;
    if (d[A].size > d[B].size) {
        d[B].parent = A;
        d[A].size += d[B].size;
    } else {
        d[A].parent = B;
        d[B].size += d[A].size;
    }
    return find(a);
}
void makeset(int a) {
    d[a].parent = a;
    d[a].size = 1;
}
struct tree {
    vector<int> v;
    int k;
} t[M * 2 + 5];

void update(int a, int v) {
    a += M;
    t[a].v.push_back(v);
    a /= 2;
    while (a != 0) {
        t[a].v.push_back(v);
        a /= 2;
    }
}
bool query(int a, int b) {
    int A = a;
    a += M;
    b += M;
    int parent = -1;
    if (!t[a].v.empty())
        parent = unite(t[a].v[t[a].k], parent);
    if (!t[b].v.empty())
        parent = unite(t[b].v[t[b].k], parent);
    while (a / 2 != b / 2) {
        if ((a & 1) == 0 && !t[a + 1].v.empty()) {
            for (--t[a + 1].k; t[a + 1].k < (int)t[a + 1].v.size();
                 t[a + 1].k++) {
                if (t[a + 1].k >= 0) {
                    parent = unite(t[a + 1].v[t[a + 1].k], parent);
                    if (edge[t[a + 1].v[t[a + 1].k]] != -1) {
                        unite(edge[t[a + 1].v[t[a + 1].k]], find(A));
                    }
                    edge[t[a + 1].v[t[a + 1].k]] = find(A);
                }
            }
        }
        if ((b & 1) == 1 && !t[b - 1].v.empty()) {
            for (--t[b - 1].k; t[b - 1].k < (int)t[b - 1].v.size();
                 t[b - 1].k++) {
                if (t[b - 1].k >= 0) {
                    parent = unite(t[b - 1].v[t[b - 1].k], parent);
                    if (edge[t[b - 1].v[t[b - 1].k]] != -1) {
                        unite(edge[t[b - 1].v[t[b - 1].k]], A);
                    }
                    edge[t[b - 1].v[t[b - 1].k]] = find(A);
                }
            }
        }
        a /= 2;
        b /= 2;
    }
    if (find(parent) == find(A)) {
        return false;
    }
    edge[A] = find(parent);
    edge[find(A)] = find(parent);
    return true;
}

void solve() {
    int n;
    cin >> n;
    vector<int> v(n);
    vector<pair<int, int>> w;
    for (auto& x : v) cin >> x;

    int nx = 1;
    int id = 0;
    vector<int> st(n + 2, -1);
    for (auto x : v) {
        st[x] = id;
        makeset(id);
        id++;
        while (nx <= n && st[nx] != -1) {
            w.emplace_back(st[nx], id);
            st[nx] = -1;
            id++;
            nx++;
        }
    }
    sort(w.begin(), w.end());
    for (int i = 0; i <= id; i++) edge[i] = -1;
    for (auto [a, b] : w) {
        bool ok = query(a, b);
        if (!ok) {
            cout << "IMPOSSIBLE\n";
            return;
        }
        update(b, a);
    }
    for (auto [a, b] : w) {
        if (color[find(a)] == 0) {
            color[find(a)] = 1;
            if (edge[find(a)] != -1) {
                color[find(edge[find(a)])] = 2;
            }
        }
        cout << color[find(a)] << ' ';
    }
    cout << '\n';
}
```

:::
