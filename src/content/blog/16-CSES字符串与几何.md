---
title: "CSES 字符串与几何"
description: "本篇包含：String Algorithms（21 题）、Geometry（16 题）。共 37 题。"
pubDate: 2026-05-05T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/16.jpg"
---
本篇包含：String Algorithms（21 题）、Geometry（16 题）。共 37 题。



## String Algorithms

### Word Combinations


**题目大意**：给定字符串 `s`（长度 `n`，$n \le 5000$）和 `k` 个单词组成的词典，求用词典中的单词（可重复使用）从左到右完整拼接出 `s` 的方案数，对 $10^9+7$ 取模。

**解题思路**：

- **观察**：一个单词能否接在已拼出的前缀后面，只取决于它是否为 `s` 当前位置左侧某一段的后缀；把词典建成 AC 自动机后，「以当前位置 `i` 结尾的词典单词」恰好对应自动机当前状态沿 `fail` 链能到达的那些终止节点。

- **做法**：建 trie 并在 BFS 求 `fail` 边时把 `fail` 祖先的单词长度并入 `out[u]`——逐层推进保证 `fail` 的 `out` 已经完整，于是 `out[v]` 就是「走到状态 `v` 时以当前位置结尾的全部单词长度」。`dp[i]` 为 `s` 前 `i` 个字符的拼接方案数，`dp[0] = 1`；沿 `s` 走自动机，每走到状态 `v` 就对 `out[v]` 中每个长度 `len` 执行 `dp[i] += dp[i-len]`，答案取 `dp[n]`。

- **正确性**：按「最后一段单词的长度」给方案分类。`out[v]` 枚举的正是所有以位置 `i` 结尾的词典单词长度，每个合法切分因此被唯一计数一次；`dp[0] = 1` 对应空前缀这一种空切分。

- **边界**：扫描 `s` 的代价是各访问状态 `out` 表大小之和，词典中若含大量互为后缀的单词（如 `a`、`aa`、`aaa`），`out` 表会明显膨胀。总时间复杂度为 $O(n + \text{总单词长度} + T)$，其中 $T$ 为扫描 `s` 时访问过的各状态 `out` 表大小之和；空间复杂度为 $O(n+\text{总单词长度})$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
struct Node {
    int next[26];
    vector<int> out;
    int fail;
    Node() {
        memset(next, -1, sizeof next);
        fail = -1;
    }
};
void solve() {
    string s;
    cin >> s;
    int n = s.size(), k;
    cin >> k;
    vector<Node> trie(1);
    for (int i = 0; i < k; i++) {
        string w;
        cin >> w;
        int v = 0;
        for (char c : w) {
            int ch = c - 'a';
            if (trie[v].next[ch] < 0) {
                trie[v].next[ch] = trie.size();
                trie.emplace_back();
            }
            v = trie[v].next[ch];
        }
        trie[v].out.push_back(w.size());
    }
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (trie[0].next[c] >= 0) {
            int u = trie[0].next[c];
            trie[u].fail = 0;
            q.push(u);
        } else
            trie[0].next[c] = 0;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        for (int c = 0; c < 26; c++) {
            int u = trie[v].next[c];
            if (u < 0)
                trie[v].next[c] = trie[trie[v].fail].next[c];
            else {
                trie[u].fail = trie[trie[v].fail].next[c];
                for (int l : trie[trie[u].fail].out) trie[u].out.push_back(l);
                q.push(u);
            }
        }
    }
    vector<ll> dp(n + 1);
    dp[0] = 1;
    int v = 0;
    for (int i = 1; i <= n; i++) {
        v = trie[v].next[s[i - 1] - 'a'];
        for (int len : trie[v].out) dp[i] = (dp[i] + dp[i - len]) % MOD;
    }
    cout << dp[n] << '\n';
}
```

:::

### String Matching


**题目大意**：统计模式串 `p` 在文本串 `s` 中出现的次数（作为子串，可重叠），$|s|, |p| \le 10^6$。

**解题思路**：

- **做法**：把两串拼成 `t = p + '$' + s`（`$` 是不在两串中出现的分隔符）并求 `t` 的 Z 函数。`z[i]` 是 `t` 与「从位置 `i` 开始的后缀」的最长公共前缀长度；扫描 `t` 统计满足 `z[i] == m`（`m` 为 `p` 的长度）的位置个数即答案。Z 算法维护已算出的最右匹配段 `[l, r]`：`i < r` 时先令 `z[i] = min(z[i-l], r-i)`（取镜像位置的值，并用它到 `r` 的距离封顶，保证不越过已知边界），再逐字符向右扩展；`r` 只在扩展成功时更新。

- **正确性**：`$` 既不在 `p` 中也不在 `s` 中，比较一旦推进到 `j = m` 就会拿 `t[m] = '$'` 去比 `s` 中的字符（或已到串尾），必然停下。于是 `s` 段中的位置都有 `z[i] <= m`，`z[i] >= m` 与 `z[i] == m` 在该段等价，恰好说明 `p` 出现在位置 `i - m - 1`；`p` 段中的位置在 `j = m - i < m` 时就已失配，`z[i] < m`，不会被误计数。

- **边界**：`r` 单调不减，每次扩展成功都把比较边界推得更远，故全部扩展的总次数不超过 $|t|$（摊还）。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
vector<int> z_algo(string s) {
    int n = s.size();
    vector<int> z(n);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        z[i] = max(0, min(z[i - l], r - i));
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}
void solve() {
    string s, p;
    cin >> s;
    int n = s.size();
    cin >> p;
    int m = p.size();

    string t = p + "$" + s;
    auto z = z_algo(t);
    int count = 0;
    for (int i = 0; i < n + m + 1; i++) {
        if (z[i] == m)
            count++;
    }
    cout << count << "\n";
}

```

:::

### Finding Borders


**题目大意**：输出字符串 `s`（$|s| \le 10^6$）的所有 border（既是前缀又是后缀、且不等于整串的子串）的长度，按升序排列。

**解题思路**：

- **做法**：求 `s` 的 Z 函数。长度 `L` 是否为 border 的判据是 `z[n-L] == L`；对 `i = n-1, n-2, \ldots, 1` 依次检查 `z[i] == n-i`，成立就输出 `L = n - i`。

- **正确性**：`z[n-L] >= L` 表示从位置 `n-L` 开始的后缀与原串的最长公共前缀覆盖了整个后缀，即 `s[0..L-1] = s[n-L..n-1]`，这正是「长度 `L` 既是前缀又是后缀」；另一方面该后缀本身只有 `L` 个字符，`z[n-L]` 不可能超过 `L`。故 `z[n-L] == L` 与「`L` 是 border」等价，判据不重不漏。

- **边界**：循环范围 `1 <= i <= n-1` 对应 `1 <= L <= n-1`，`L = 0` 与 `L = n`（整串）都不在其中；`i` 递减使 `L = n - i` 递增，输出天然升序。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
vector<int> z_algo(string s) {
    int n = s.size();
    vector<int> z(n);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        z[i] = max(0, min(z[i - l], r - i));
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}
void solve() {
    string s;
    cin >> s;
    int n = s.size();

    auto z = z_algo(s);
    for (int i = n - 1; i > 0; i--) {
        if (z[i] == n - i) {
            cout << n - i << " ";
        }
    }
    cout << "\n";
}
```

:::

### Finding Periods


**题目大意**：输出字符串 `s`（$|s| \le 10^6$）的所有周期长度 `L`：用前缀 `s[0..L-1]` 重复拼接能覆盖整串，且最后一个周期允许只取一部分。

**解题思路**：

- **做法**：求 `s` 的 Z 函数，对每个 `L = 1, 2, \ldots, n` 检查 `z[L] >= n - L`，成立则输出 `L`。

- **正确性**：`z[L] >= n - L` 表示从位置 `L` 开始的后缀与原串的公共前缀一直覆盖到串尾，即对每个 $j \in [L, n-1]$ 都有 `s[j] = s[j-L]`：每个位置都与它前面第 `L` 个字符相同，也就是前缀被平移 `L` 后与自身吻合；反过来，`L` 为周期时这些等式全部成立，必有 `z[L] >= n - L`。等价地，`L` 是周期当且仅当长度 $n-L$ 的串既是前缀又是后缀。

- **边界**：`L = n` 时不等式右端为 0，条件恒成立，整串长度总会被输出；`L = 1` 只在 `s` 全部由同一字符组成时成立。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
vector<int> z_algo(const string& s) {
    int n = s.size();
    vector<int> z(n + 1);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r)
            z[i] = min(z[i - l], r - i);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    auto z = z_algo(s);
    for (int L = 1; L <= n; L++)
        if (z[L] >= n - L)
            cout << L << ' ';
    cout << '\n';
}
```

:::

### Minimal Rotation


**题目大意**：求字符串 `s`（$|s| \le 10^6$）的所有循环旋转中字典序最小的那个。

**解题思路**：

- **做法**：`minimal_rotation` 内部先把 `s` 复制拼接成 `s + s`，在其上在线比较所有旋转起点。`k` 是当前最优起点，`f` 是失败函数，`f[j-k-1]` 给出以 `k` 为起点时已经匹配的公共前缀长度；把位置 `j` 依次加入比较，失配时若 `s[j] < s[k+i+1]` 就把最优起点更新为 `k = j - i - 1`，再令 `i = f[i]` 沿失败函数回退；匹配成功则记 `f[j-k] = i + 1`。返回的 `k` 即最优起点，输出 `s.substr(k) + s.substr(0, k)`。

- **正确性**：循环中 `k` 始终是已比较过的起点里字典序最小的旋转起点；失败函数让公共前缀的比对结果被保留下来，失配后从 `f[i]` 继续，不必重新从头比较。已匹配长度的增长与回退相互抵消，整个循环的摊还代价为 $O(n)$。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int minimal_rotation(string s) {
    s += s;
    int n = s.size();
    vector<int> f(n, -1);
    int k = 0;
    for (int j = 1; j < n; j++) {
        int i = f[j - k - 1];
        while (i != -1 && s[j] != s[k + i + 1]) {
            if (s[j] < s[k + i + 1])
                k = j - i - 1;
            i = f[i];
        }
        if (i == -1 && s[j] != s[k + i + 1]) {
            if (s[j] < s[k])
                k = j;
            f[j - k] = -1;
        } else
            f[j - k] = i + 1;
    }
    return k;
}
void solve() {
    string s;
    cin >> s;
    int k = minimal_rotation(s);
    cout << s.substr(k) + s.substr(0, k) << '\n';
}
```

:::

### Longest Palindrome


**题目大意**：求字符串 `s` 的最长回文子串（`s` 长度可达 $10^6$）。

**解题思路**：

- **做法**：在 `s` 的每个字符间插入分隔符 `#` 得到 `t`（如 `#a#b#a#`），奇数长度与偶数长度的回文就都化为「以 `t` 中某个字符为中心的奇回文」。`d[i]` 为以 `i` 为中心的回文半径（含中心），对应区间 $[i-d[i]+1, i+d[i]-1]$。扫描时维护已到达的最右边界 `l = i - k`、`r = i + k`：`i < r` 时取 `k = min(d[l+r-i], r-i)`，否则取 `k = 1`，再逐字符向外扩展。最后取 `d` 最大的中心 `center`，把 `t[center-d+1 .. center+d-1]` 中的非 `#` 字符依次接起来即答案。

- **正确性**：`i < r` 时以 `i` 为中心的回文与以镜像 `l+r-i` 为中心的回文在 `[l, r]` 内逐位对称：镜像半径小于 `r-i` 时 `d[i]` 与之相等（再往外比较必定失败），否则 `d[i]` 至少为 `r-i`，需要继续向外验证。因此初值取两者较小者既不遗漏也不越界，随后的暴力扩展恰好补上超出部分；右边界 `r` 只在扩展成功时变大，全部扩展的总次数为 $O(|t|) = O(n)$。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    string t = "#";
    for (char c : s) {
        t += c;
        t += '#';
    }
    int m = t.size();
    vector<int> d(m);
    int l = 0, r = 0;
    for (int i = 0; i < m; i++) {
        int k = i < r ? min(d[l + r - i], r - i) : 1;
        while (i - k >= 0 && i + k < m && t[i - k] == t[i + k]) k++;
        d[i] = k;
        if (i + k > r) {
            l = i - k;
            r = i + k;
        }
    }
    int best = 0, center = 0;
    for (int i = 0; i < m; i++)
        if (d[i] > best) {
            best = d[i];
            center = i;
        }
    string ans;
    for (int i = center - best + 1; i < center + best; i++)
        if (t[i] != '#')
            ans += t[i];
    cout << ans << '\n';
}
```

:::

### All Palindromes


**题目大意**：对字符串 `s` 的每个位置 `i`（1 起始），输出以 `i` 为右端点的最长回文子串的长度。

**解题思路**：

- **观察**：用 Manacher 求出全部奇回文半径 `d1`、偶回文半径 `d2` 后，只需对每个右端点 `i` 找覆盖它的最长回文。以奇回文为例：中心 `c` 的回文覆盖右端点区间 $[c, c+d1[c]-1]$，对区间内的 `i` 给出的长度为 $2(i-c)+1$，它随 `c` 减小而增大，所以在所有覆盖 `i` 的中心里取 `c` 最小者即最优。

- **做法**：扫描 `i` 时把「中心为 `i`、右端点为 `i + d1[i] - 1`（偶回文则为 `i + d2[i] - 1`）」的区间按 `(中心, 右端点)` 压入小根堆；堆顶右端点小于 `i` 的中心已无法覆盖当前右端点，惰性弹出，此后堆顶的 `first` 就是覆盖 `i` 的最小中心 `c`：奇回文答案取 $2(i-c)+1$、偶回文取 $2(i-c+1)$，与初值取大。

- **边界**：`ans` 初值为 1（每个单字符本身是回文）；`d2[i]` 可以为 0，这类区间入堆后立即因右端点小于 `i` 而被弹出，不影响结果。时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    vector<int> d1(n), d2(n);
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = i > r ? 1 : min(d1[l + r - i], r - i + 1);
        while (i - k >= 0 && i + k < n && s[i - k] == s[i + k]) k++;
        d1[i] = k--;
        if (i + k > r) {
            l = i - k;
            r = i + k;
        }
    }
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = i > r ? 0 : min(d2[l + r - i + 1], r - i + 1);
        while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] == s[i + k]) k++;
        d2[i] = k--;
        if (i + k > r) {
            l = i - k - 1;
            r = i + k;
        }
    }
    vector<int> ans(n, 1);
    for (int parity = 0; parity < 2; parity++) {
        priority_queue<pair<int, int>, vector<pair<int, int>>,
                       greater<pair<int, int>>>
            pq;
        for (int i = 0; i < n; i++) {
            int end = (parity == 0) ? i + d1[i] - 1 : i + d2[i] - 1;
            pq.push({i, end});
            while (!pq.empty() && pq.top().second < i) pq.pop();
            if (!pq.empty()) {
                int c = pq.top().first;
                if (parity == 0)
                    ans[i] = max(ans[i], 2 * (i - c) + 1);
                else
                    ans[i] = max(ans[i], 2 * (i - c + 1));
            }
        }
    }
    for (int x : ans) cout << x << ' ';
    cout << '\n';
}
```

:::

### Required Substring


**题目大意**：求长度为 `n`（$n \le 1000$）、由大写字母 A~Z 组成、且包含给定模式串 `p`（长度 `m`，$m \le 100$）作为子串的字符串个数，对 $10^9+7$ 取模。

**解题思路**：

- **观察**：逐个字符构造时，判断「模式串是否已经出现」不需要记住整个串，只需记住当前后缀能匹配 `p` 的最长前缀长度：再追加一个字符后，新的匹配长度只由这个长度和该字符决定，因此它可以作为 DP 的状态。

- **做法**：先求 `p` 的前缀函数 `pi`，`pi[i]` 是前缀 `p[0..i]` 的最长真 border 长度。再预处理 `nxt[st][c]`：从已匹配 `st` 个字符的状态出发追加字符 `c`，沿 `pi[st-1]`、`pi[pi[st-1]-1]`、… 回退到第一个能接上 `c` 的位置，接上后新状态为 `j + 1`；`st = m` 表示 `p` 已经出现，那一行统一填 `m`，不参与转移。`dp[i][st]` 表示构造了 `i` 个字符、当前匹配长度为 `st` 的串数，转移枚举字符 `c` 并跳过 `nxt[st][c] == m` 的边。

- **正确性**：`bad` 定义为所有满足 $st < m$ 的 $dp[n][st]$ 之和，它恰好是所有长度为 `n` 且不含 `p` 的串——这类串在构造过程中匹配长度始终不超过 `m-1`，唯一对应一条 DP 路径，反过来每条 DP 路径拼出的串也都不含 `p`。答案为补集，即 $26^n - bad$。

- **边界**：取模后的 $26^n$ 与 `bad` 的大小关系不定，代码用 `((total - bad) % MOD + MOD) % MOD` 修正可能出现的负数。时间复杂度为 $O(n \cdot m \cdot 26)$，空间复杂度为 $O(n \cdot m)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n;
    string p;
    cin >> n >> p;
    int m = p.size();
    vector<int> pi(m);
    for (int i = 1; i < m; i++) {
        int j = pi[i - 1];
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j])
            j++;
        pi[i] = j;
    }
    vector<vector<int>> nxt(m + 1, vector<int>(26));
    for (int st = 0; st <= m; st++)
        for (int c = 0; c < 26; c++) {
            if (st == m) {
                nxt[st][c] = m;
                continue;
            }
            int j = st;
            while (j > 0 && p[j] != char('A' + c)) j = pi[j - 1];
            if (p[j] == char('A' + c))
                j++;
            nxt[st][c] = j;
        }
    vector<vector<ll>> dp(n + 1, vector<ll>(m + 1));
    dp[0][0] = 1;
    for (int i = 0; i < n; i++)
        for (int st = 0; st < m; st++)
            for (int c = 0; c < 26; c++) {
                int ns = nxt[st][c];
                if (ns == m)
                    continue;
                dp[i + 1][ns] = (dp[i + 1][ns] + dp[i][st]) % MOD;
            }
    ll total = 1;
    for (int i = 0; i < n; i++) total = total * 26 % MOD;
    ll bad = 0;
    for (int st = 0; st < m; st++) bad = (bad + dp[n][st]) % MOD;
    cout << ((total - bad) % MOD + MOD) % MOD << '\n';
}
```

:::

### Palindrome Queries


**题目大意**：长度为 `n` 的字符串（$n \le 2 \times 10^5$）与 `m` 次操作，操作分两种：单点修改一个字符；查询子串 `[a, b]` 是否为回文。

**解题思路**：

- **做法**：分别维护正序与逆序的多项式哈希，各用一棵树状数组求前缀和。取底数 `B = 911382323`、模数 $10^9+9$，令 `f[i] = s[i] * B^i`、`g[i] = s[n-i+1] * B^i`（幂表 `pw[i] = B^i`）：`f` 按原序维护、`g` 把串反转后维护。修改 `s[k]` 为 `x` 时对 `f` 的位置 `k`、对 `g` 的位置 `n-k+1` 分别加上 `(x - s[k]) * pw[k]` 与 `(x - s[k]) * pw[n-k+1]`；查询 `[a, b]` 时取 `h1 = f.qry(a, b) * pw[n-b]`、`h2 = g.qry(n-b+1, n-a+1) * pw[a-1]`。

- **正确性**：对齐后 `h1` 中 $s[j]$ 的指数为 $n-b+j$，`h2` 中来自位置 `j'` 的项指数为 $n+a-j'$；两式指数相同时 $j' = a+b-j$，即互为 `[a, b]` 中的对称位置。于是 `h1 == h2` 等价于对所有 `a <= j <= b` 都有 $s[j] = s[a+b-j]$，正是「子串是回文」（哈希冲突概率可忽略）。相等输出 YES，否则 NO。

- **边界**：树状数组下标从 1 起，位置 `k` 在逆序串中对应 `n-k+1`，修改与查询都按这一对应取区间；`g` 的前缀和本身按逆序存放，查询区间也要相应反转。时间复杂度为 $O((n+m) \log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 9;
struct BIT {
    int n;
    vector<ll> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i, ll x) {
        for (; i <= n; i += i & -i) t[i] = (t[i] + x) % MOD;
    }
    ll sum(int i) {
        ll r = 0;
        for (; i > 0; i -= i & -i) r = (r + t[i]) % MOD;
        return r;
    }
    ll qry(int l, int r) {
        return (sum(r) - sum(l - 1) + MOD) % MOD;
    }
};
void solve() {
    int n, m;
    cin >> n >> m;
    string s;
    cin >> s;
    s = " " + s;
    const ll B = 911382323;
    vector<ll> pw(n + 1);
    pw[0] = 1;
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * B % MOD;
    BIT f(n), g(n);
    for (int i = 1; i <= n; i++) {
        f.add(i, s[i] * pw[i] % MOD);
        g.add(i, s[n - i + 1] * pw[i] % MOD);
    }
    while (m--) {
        int t;
        cin >> t;
        if (t == 1) {
            int k;
            char x;
            cin >> k >> x;
            f.add(k, (x - s[k] + MOD) % MOD * pw[k] % MOD);
            int j = n - k + 1;
            g.add(j, (x - s[k] + MOD) % MOD * pw[j] % MOD);
            s[k] = x;
        } else {
            int a, b;
            cin >> a >> b;
            ll h1 = f.qry(a, b) * pw[n - b] % MOD;
            int a2 = n - b + 1, b2 = n - a + 1;
            ll h2 = g.qry(a2, b2) * pw[n - b2] % MOD;
            cout << (h1 == h2 ? "YES" : "NO") << '\n';
        }
    }
}
```

:::

### Finding Patterns


**题目大意**：给定文本串 `s`（$|s| \le 10^5$）和 `k` 个模式串（总长度 $\le 5 \times 10^5$），对每个模式串判断它是否在 `s` 中出现过。

**解题思路**：

- **做法**：把所有模式串建成 trie，从根 BFS 求 `fail` 边并补全转移（不存在的儿子直接指向 `fail` 的对应儿子，使自动机读入任意字符都不需要回溯），同时用 `order` 记下 BFS 访问顺序。扫一遍 `s`，把走到的每个状态的 `vis` 置真；再按 `order` 的逆序把 `vis` 沿 `fail` 边向上传播。最后查每个模式串终止节点 `term[i]` 的 `vis`，为真输出 YES，否则 NO。

- **正确性**：走到状态 `v` 并置 `vis`，表示「以该位置结尾、长度等于 `v` 在 trie 中深度的串」出现过；`fail` 链恰好枚举 `v` 的所有后缀，故向上传播后 `vis[x]` 为真当且仅当 `x` 代表的串真正出现过，终止于 `x` 的模式串因此被正确判定。`fail` 边总指向 BFS 序中更早访问的状态，逆序传播保证儿子先于父亲处理完，一遍即可收敛。时间复杂度为 $O(|s|+\text{总模式长度})$，空间复杂度为 $O(\text{总模式长度})$。

:::details[题解(C++)]

```c++
struct Node {
    int next[26];
    int fail;
    bool vis;
    Node() {
        memset(next, -1, sizeof next);
        fail = 0;
        vis = false;
    }
};
void solve() {
    string s;
    cin >> s;
    int k;
    cin >> k;
    vector<Node> trie(1);
    vector<int> term(k);
    for (int i = 0; i < k; i++) {
        string w;
        cin >> w;
        int v = 0;
        for (char c : w) {
            int ch = c - 'a';
            if (trie[v].next[ch] < 0) {
                trie[v].next[ch] = trie.size();
                trie.emplace_back();
            }
            v = trie[v].next[ch];
        }
        term[i] = v;
    }
    vector<int> order;
    order.push_back(0);
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (trie[0].next[c] >= 0) {
            trie[trie[0].next[c]].fail = 0;
            q.push(trie[0].next[c]);
        } else
            trie[0].next[c] = 0;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        order.push_back(v);
        for (int c = 0; c < 26; c++) {
            int u = trie[v].next[c];
            if (u < 0)
                trie[v].next[c] = trie[trie[v].fail].next[c];
            else {
                trie[u].fail = trie[trie[v].fail].next[c];
                q.push(u);
            }
        }
    }
    int v = 0;
    for (char c : s) {
        v = trie[v].next[c - 'a'];
        trie[v].vis = true;
    }
    for (int i = order.size() - 1; i >= 1; i--) {
        int x = order[i];
        trie[trie[x].fail].vis |= trie[x].vis;
    }
    for (int i = 0; i < k; i++)
        cout << (trie[term[i]].vis ? "YES" : "NO") << '\n';
}
```

:::

### Counting Patterns


**题目大意**：给定文本串 `s`（$|s| \le 10^5$）和 `k` 个模式串（总长度 $\le 5 \times 10^5$），对每个模式串输出它在 `s` 中出现的次数。

**解题思路**：

- **做法**：建 AC 自动机，构建 `fail` 边时顺便把每个状态登记为 `fail` 的儿子 `ch`，得到 fail 树。扫一遍 `s`，走到一个状态就把它的 `cnt` 加 1；随后从根对 fail 树 DFS，回溯时把子树内的 `cnt` 全部累加到父节点。每个模式串的答案就是它终止节点 `term[i]` 的 `cnt`。

- **正确性**：fail 树中状态 `t` 是 `v` 的祖先，当且仅当 `t` 代表的串是 `v` 代表串的后缀。一次出现会使「该结束位置走到的状态」的 `cnt` 加 1，而这恰好就是「模式串在该位置出现」的条件；每个模式串的每次出现都让它的子树内恰好一个状态加 1，故子树和就是出现次数，不重不漏。时间复杂度为 $O(|s|+\text{总模式长度})$，空间复杂度为 $O(\text{总模式长度})$。

:::details[题解(C++)]

```c++
struct Node {
    int next[26];
    int fail;
    int cnt;
    vector<int> ch;
    Node() {
        memset(next, -1, sizeof next);
        fail = 0;
        cnt = 0;
    }
};
void solve() {
    string s;
    cin >> s;
    int k;
    cin >> k;
    vector<Node> trie(1);
    vector<int> term(k);
    for (int i = 0; i < k; i++) {
        string w;
        cin >> w;
        int v = 0;
        for (char c : w) {
            int ch = c - 'a';
            if (trie[v].next[ch] < 0) {
                trie[v].next[ch] = trie.size();
                trie.emplace_back();
            }
            v = trie[v].next[ch];
        }
        term[i] = v;
    }
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (trie[0].next[c] >= 0) {
            trie[trie[0].next[c]].fail = 0;
            q.push(trie[0].next[c]);
        } else
            trie[0].next[c] = 0;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        trie[trie[v].fail].ch.push_back(v);
        for (int c = 0; c < 26; c++) {
            int u = trie[v].next[c];
            if (u < 0)
                trie[v].next[c] = trie[trie[v].fail].next[c];
            else {
                trie[u].fail = trie[trie[v].fail].next[c];
                q.push(u);
            }
        }
    }
    int v = 0;
    for (char c : s) {
        v = trie[v].next[c - 'a'];
        trie[v].cnt++;
    }
    function<void(int)> dfs = [&](int x) {
        for (int y : trie[x].ch) {
            dfs(y);
            trie[x].cnt += trie[y].cnt;
        }
    };
    dfs(0);
    for (int i = 0; i < k; i++) cout << trie[term[i]].cnt << '\n';
}
```

:::

### Pattern Positions


**题目大意**：给定文本串 `s`（$|s| \le 10^5$）和 `k` 个模式串（总长度 $\le 5 \times 10^5$），对每个模式串输出它在 `s` 中第一次出现的位置（1 起始），未出现输出 -1。

**解题思路**：

- **做法**：沿用 fail 树的框架，把计数换成最早位置：扫描 `s` 时对第 `i` 个字符（1 起始）走到的状态执行 `pos = min(pos, i)`，再对 fail 树自底向上取 min。此时 `term[i]` 处的 `pos` 就是该模式串最早出现的结束位置。

- **正确性**：状态 `v` 在位置 `i` 被走到，说明「以 `i` 结尾、长度等于 `v` 深度的串」出现；`fail` 链枚举 `v` 的全部后缀，故子树取 min 之后 `term[i]` 收到的是「以该模式串为后缀的某个结束位置」中最小的那个，正是它首次出现的结束位置。

- **边界**：起点为 `pos - 长度 + 1`（1 起始）；`pos` 保留初值 $10^9$ 说明该状态从未被走到，输出 -1。时间复杂度为 $O(|s|+\text{总模式长度})$，空间复杂度为 $O(\text{总模式长度})$。

:::details[题解(C++)]

```c++
struct Node {
    int next[26];
    int fail;
    int pos;
    vector<int> ch;
    Node() {
        memset(next, -1, sizeof next);
        fail = 0;
        pos = 1e9;
    }
};
void solve() {
    string s;
    cin >> s;
    int k;
    cin >> k;
    vector<Node> trie(1);
    vector<int> term(k), tlen(k);
    for (int i = 0; i < k; i++) {
        string w;
        cin >> w;
        int v = 0;
        for (char c : w) {
            int ch = c - 'a';
            if (trie[v].next[ch] < 0) {
                trie[v].next[ch] = trie.size();
                trie.emplace_back();
            }
            v = trie[v].next[ch];
        }
        term[i] = v;
        tlen[i] = w.size();
    }
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (trie[0].next[c] >= 0) {
            trie[trie[0].next[c]].fail = 0;
            q.push(trie[0].next[c]);
        } else
            trie[0].next[c] = 0;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        trie[trie[v].fail].ch.push_back(v);
        for (int c = 0; c < 26; c++) {
            int u = trie[v].next[c];
            if (u < 0)
                trie[v].next[c] = trie[trie[v].fail].next[c];
            else {
                trie[u].fail = trie[trie[v].fail].next[c];
                q.push(u);
            }
        }
    }
    int v = 0, n = s.size();
    for (int i = 1; i <= n; i++) {
        v = trie[v].next[s[i - 1] - 'a'];
        trie[v].pos = min(trie[v].pos, i);
    }
    function<void(int)> dfs = [&](int x) {
        for (int y : trie[x].ch) {
            dfs(y);
            trie[x].pos = min(trie[x].pos, trie[y].pos);
        }
    };
    dfs(0);
    for (int i = 0; i < k; i++) {
        int p = trie[term[i]].pos;
        cout << (p >= 1e9 ? -1 : p - tlen[i] + 1) << '\n';
    }
}
```

:::

### Distinct Substrings


**题目大意**：求字符串 `s`（$|s| \le 10^5$）的不同子串个数。

**解题思路**：

- **做法**：对 `s` 建后缀自动机，转移用 `map<char, int>` 存放（字符集可能较大）；克隆状态时整段复制 `q` 的转移。答案对除初始状态外的每个状态 `v` 累加 $\operatorname{len}(v) - \operatorname{len}(\operatorname{link}(v))$。

- **正确性**：SAM 的转移是确定的，从根出发的每条路径恰好拼出一个子串，故路径与子串一一对应；状态 `v` 对应的正是「路径终点为 `v`」的那些子串，其长度构成连续区间 $[\operatorname{len}(\operatorname{link}(v))+1, \operatorname{len}(v)]$，区间内每个长度各有一个子串。所有状态把这些子串划分完毕且两两不同，故上式求和恰好数出全部不同子串，不重不漏。时间复杂度为 $O(n \log |\Sigma|)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
struct SAM {
    int last;
    vector<map<char, int>> next;
    vector<int> link, len;
    SAM(int n) {
        next.resize(2 * n + 5);
        link.resize(2 * n + 5);
        len.resize(2 * n + 5);
        last = 0;
        link[0] = -1;
    }
    void add(char c) {
        int cur = next.size();
        next.emplace_back();
        link.push_back(0);
        len.push_back(len[last] + 1);
        int p = last;
        while (p != -1 && !next[p].count(c)) {
            next[p][c] = cur;
            p = link[p];
        }
        if (p == -1)
            link[cur] = 0;
        else {
            int q = next[p][c];
            if (len[p] + 1 == len[q])
                link[cur] = q;
            else {
                int clone = next.size();
                next.emplace_back();
                link.push_back(0);
                len.push_back(len[p] + 1);
                next[clone] = next[q];
                link[clone] = link[q];
                while (p != -1 && next[p].count(c) && next[p][c] == q) {
                    next[p][c] = clone;
                    p = link[p];
                }
                link[q] = link[cur] = clone;
            }
        }
        last = cur;
    }
};
void solve() {
    string s;
    cin >> s;
    SAM sam(s.size());
    for (char c : s) sam.add(c);
    ll ans = 0;
    for (int i = 1; i < (int)sam.len.size(); i++)
        ans += sam.len[i] - sam.len[sam.link[i]];
    cout << ans << '\n';
}
```

:::

### Distinct Subsequences


**题目大意**：给定字符串 `s`，求它的不同子序列（按位置选出的序列，相同内容只算一次）的个数，对 $10^9+7$ 取模。

**解题思路**：从左到右扫 `s`，用 `count[c]` 记录以字符 `c` 结尾的不同子序列个数。读到 `s[i]` 时先把 `1` 与当前所有 `count[c]` 相加得到 `sum`——`1` 是只由 `s[i]` 组成的单字符子序列，其余是给每个已有的不同子序列末尾追加 `s[i]`，而追加是单射，这批新子序列互不相同；再执行 `count[s[i]] = sum`，覆盖旧值正是去重的关键：以同一字符结尾的旧子序列都能由这个位置重新生成，继续保留就会重复计数。答案为所有 `count[c]` 之和，循环变量 `c` 取遍 `'a'..'z'`，模数用代码里的 `M = 10^9+7`。时间复杂度为 $O(26n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
const int M = 1000000007;
void solve() {
    string s;
    cin >> s;
    int n = s.size();

    map<char, int> count;
    for (int i = 0; i < n; i++) {
        int sum = 1;
        for (int c = 'a'; c <= 'z'; c++) {
            sum += count[c];
            sum %= M;
        }
        count[s[i]] = sum;
    }

    ll ans = 0;
    for (int c = 'a'; c <= 'z'; c++) {
        ans += count[c];
        ans %= M;
    }

    cout << ans << "\n";
}
```

:::

### Repeating Substring


**题目大意**：求字符串 `s`（$|s| \le 10^5$）中出现至少两次的最长子串（两次出现可重叠），不存在输出 -1。

**解题思路**：

- **做法**：建后缀自动机，同时记录每个状态的最早出现位置：新状态 `cur` 的 `minp` 取当前下标 `i`，克隆状态时继承 `q` 的 `minp`。按 `len` 计数排序得到拓扑序，先把每个前缀对应的状态 `occ` 置 1，再倒序把 `occ` 累加到 `link` 上、并把 `minp` 沿 `link` 传递下去。最后取 `occ >= 2` 且 `len` 最大的状态 `best`，输出以 `minp` 结尾、长度为 `bestLen` 的那一段 `s[minp-bestLen+1 .. minp]`。

- **正确性**：状态的 `occ` 是它的 endpos 集合大小，也就是该状态所代表子串的出现次数——每个前缀对应状态贡献 1，沿 `link` 累加后祖先恰好收到自己每个 endpos 位置的贡献。取出「出现至少两次」中 `len` 最大的状态即得到最长重复子串；`minp` 是该状态某个 endpos 的最小值，而 endpos 正是该状态最长串的结束位置集合，因此以 `minp` 结尾、长度为 `bestLen` 的那一段就属于该状态，是合法答案。

- **边界**：没有任何子串出现两次时（如所有字符互不相同）输出 -1。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    struct S {
        int nxt[26];
        int link = -1, len = 0, minp = 1e9;
        S() { memset(nxt, -1, sizeof nxt); }
    };
    vector<S> st(2 * n + 5);
    int sz = 1, last = 0;
    for (int i = 0; i < n; i++) {
        int cur = sz++;
        st[cur].len = st[last].len + 1;
        st[cur].minp = i;
        int p = last;
        while (p != -1 && st[p].nxt[s[i] - 'a'] < 0) {
            st[p].nxt[s[i] - 'a'] = cur;
            p = st[p].link;
        }
        if (p == -1)
            st[cur].link = 0;
        else {
            int q = st[p].nxt[s[i] - 'a'];
            if (st[p].len + 1 == st[q].len)
                st[cur].link = q;
            else {
                int cl = sz++;
                st[cl] = st[q];
                st[cl].len = st[p].len + 1;
                while (p != -1 && st[p].nxt[s[i] - 'a'] == q) {
                    st[p].nxt[s[i] - 'a'] = cl;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = cl;
            }
        }
        last = cur;
    }
    vector<int> occ(sz);
    for (int p = 0, i = 0; i < n; i++) {
        p = st[p].nxt[s[i] - 'a'];
        occ[p]++;
    }
    vector<int> cnt(st[last].len + 1);
    for (int i = 1; i < sz; i++) cnt[st[i].len]++;
    for (int i = 1; i <= st[last].len; i++) cnt[i] += cnt[i - 1];
    vector<int> order(sz);
    for (int i = 1; i < sz; i++) order[--cnt[st[i].len]] = i;
    for (int i = sz - 1; i >= 1; i--) {
        int v = order[i];
        if (st[v].link != -1) {
            occ[st[v].link] += occ[v];
            st[st[v].link].minp = min(st[st[v].link].minp, st[v].minp);
        }
    }
    int best = -1, bestLen = 0;
    for (int i = 1; i < sz; i++)
        if (occ[i] >= 2 && st[i].len > bestLen) {
            best = i;
            bestLen = st[i].len;
        }
    if (best == -1) {
        cout << -1 << '\n';
        return;
    }
    cout << s.substr(st[best].minp - bestLen + 1, bestLen) << '\n';
}
```

:::

### String Functions


**题目大意**：输出字符串 `s`（$|s| \le 10^6$）的 Z 函数（`z[0..n-1]`）与 KMP 前缀函数（`pi[0..n-1]`），各占一行。

**解题思路**：

- **做法**：Z 函数中 `z[i]` 是串与从位置 `i` 开始的后缀的最长公共前缀长度，`z[0]` 保持 0；用 `[l, r]` 维护已算出的最右匹配段，`i < r` 时先令 `z[i] = min(z[i-l], r-i)`，再逐字符扩展，`r` 只在扩展成功时右移。前缀函数中 `pi[i]` 是前缀 `s[0..i]` 的最长真 border 长度（既是真前缀又是真后缀的最长长度），`pi[0]` 保持 0；计算 `pi[i]` 时令 `j = pi[i-1]`，若 `s[j] != s[i]` 就回退 `j = pi[j-1]`，回退到能接上 `s[i]` 的位置后，若 `s[i] == s[j]` 则 `pi[i] = j + 1`，否则 `pi[i] = 0`。最后依次输出 `z` 与 `pi`。

- **正确性**：`s[0..i-1]` 的全部 border 长度恰好构成链 `pi[i-1]`、`pi[pi[i-1]-1]`、…（每个 border 的最长真 border 又是原串的 border），所以候选长度只需沿这条链回退枚举，第一个满足 `s[j] == s[i]` 的 `j` 给出的 `j + 1` 就是最长的那个。摊还分析：`j` 每回退一次至少减 1，每轮循环至多增加 1，故回退总次数不超过 $n$，两段算法都是线性。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    vector<int> z(n);
    {
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i < r)
                z[i] = min(z[i - l], r - i);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > r) {
                l = i;
                r = i + z[i];
            }
        }
    }
    vector<int> pi(n);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j])
            j++;
        pi[i] = j;
    }
    for (int x : z) cout << x << ' ';
    cout << '\n';
    for (int x : pi) cout << x << ' ';
    cout << '\n';
}
```

:::

### Inverse Suffix Array


**题目大意**：给定一个 1..n 的排列作为后缀数组（`sa[i]` 表示字典序第 `i` 小的后缀的起点），构造一个能产生该后缀数组的小写字母串，不存在输出 -1；如输入 `2` 与 `2 1` 时应输出 `ba`。

**解题思路**：

- **观察**：后缀数组给出 `rank[sa[i]] = i`。依次比较相邻后缀 `a = sa[i]`、`b = sa[i+1]`：它们首字符相同时，大小关系只能由去掉首字符后的后缀决定，即必须满足 `rank[a+1] < rank[b+1]`；某一侧已到末尾时把空后缀视为字典序最小（`a + 1 == n` 恒满足，`b + 1 == n` 恒不满足）。该条件成立时 `s[b]` 可以取与 `s[a]` 相同的字符，否则必须严格更大（字母序号 +1）。

- **做法**：`cur` 记录当前字母序号，按上述规则从 `s[sa[0]] = 'a'` 起逐个定出 `s[sa[i+1]]`；`cur` 超过 25 说明需要 26 个以上不同字符，输出 -1。构造出的串满足全部相邻关系，再由字典序的传递性即可保证整个后缀数组合法。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> sa(n);
    for (int i = 0; i < n; i++) {
        cin >> sa[i];
        sa[i]--;
    }
    vector<int> rank(n);
    for (int i = 0; i < n; i++) rank[sa[i]] = i;
    vector<char> s(n);
    int cur = 0;
    s[sa[0]] = 'a';
    for (int i = 0; i + 1 < n; i++) {
        int a = sa[i], b = sa[i + 1];
        bool smaller;
        if (a + 1 < n && b + 1 < n)
            smaller = rank[a + 1] < rank[b + 1];
        else if (a + 1 < n)
            smaller = false;
        else
            smaller = true;
        if (!smaller)
            cur++;
        if (cur > 25) {
            cout << -1 << '\n';
            return;
        }
        s[b] = char('a' + cur);
    }
    for (char c : s) cout << c;
    cout << '\n';
}
```

:::

### String Transform


**题目大意**：给定一个字符串经过 Burrows-Wheeler 变换后的结果（长度为 `n`，含一个哨兵字符 `#`，它是原串末尾的标记且字典序最小），还原出原字符串。

**解题思路**：

- **做法**：Burrows-Wheeler 变换把串的所有循环移位按字典序排成方阵并取最后一列；相同字符因此聚集成段，且由最后一列可唯一还原原串。输入的变换串就是最后一列 `t`，把它排序即得第一列 `F`。用计数排序（`cnt` 统计各字符出现次数、`start` 求每个字符在 `F` 中的起始位置）建立 LF 映射：`next[i]` 取值为 `start[t[i]]` 加上第 `i` 个字符在 `t[0..i-1]` 中已经出现的次数，再取逆映射 `succ`。从 `F` 中 `#` 所在的行出发沿 `succ` 走 `n` 步，每步读出 `F` 列的字符，最后滤掉 `#` 即得原串。

- **正确性**：方阵每一行都是原串的一个循环移位。第 `i` 行的末字符 `t[i]` 是它的起点在原串中的前一个字符，`start` 与出现次序保证相同字符按同名次对应，于是 `next` 把第 `i` 行接到「起点向前挪一格」的那一行，`succ` 是它的逆、即「起点向后挪一格」。`#` 字典序最小，`F` 中 `#` 所在行正是起点落在原串末尾标记处的那一行，从这里出发每步后移起点，依次读到的 `F` 列字符就是原串（首个读到的是最后被滤掉的 `#`）。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    string t;
    cin >> t;
    int n = t.size();
    string F = t;
    sort(F.begin(), F.end());
    vector<int> cnt(256, 0);
    for (char c : t) cnt[(unsigned char)c]++;
    vector<int> start(256, 0);
    for (int i = 1; i < 256; i++) start[i] = start[i - 1] + cnt[i - 1];
    vector<int> rank(256, 0), next(n);
    for (int i = 0; i < n; i++)
    {
        next[i] = start[(unsigned char)t[i]] + rank[(unsigned char)t[i]];
        rank[(unsigned char)t[i]]++;
    }
    vector<int> succ(n);
    for (int i = 0; i < n; i++) succ[next[i]] = i;
    int idx = 0;
    while (F[idx] != '#') idx++;
    string ans;
    for (int k = 0; k < n; k++)
    {
        ans += F[idx];
        idx = succ[idx];
    }
    string res;
    for (char c : ans)
        if (c != '#') res += c;
    cout << res << '\n';
}
```

:::

### Substring Order I


**题目大意**：把字符串 `s`（$|s| \le 10^5$）的所有**不同**子串按字典序排序，输出第 `k` 小的子串。

**解题思路**：

- **做法**：建后缀自动机，按 `len` 计数排序得到拓扑序。`ways[v]` 表示从状态 `v` 出发还能形成的不同子串数，取 `ways[v] = 1 +` 所有后继字符 `c` 的 `ways[next[v][c]]` 之和：`1` 表示就在这里停下（当前串本身算一个），求和项是继续追加字符得到的长串。求第 `k` 小：从根出发按字符 `a..z` 试每条边 `next[v][c] = u`，若 `k > ways[u]` 说明以该字符开头的子串整段排在前 `ways[u]` 位，令 `k -= ways[u]` 跳过；否则选定该字符、`k--` 并进入 `u`，直到 `k == 0`。

- **正确性**：SAM 的转移是确定的，从根出发的路径与不同子串一一对应，故 `ways[v]` 的递推不重不漏地数出以 `v` 处为前缀的全部不同子串。按字符升序枚举边时，同一字符开头的子串在字典序中连续成一段，`k > ways[u]` 时的减法正好把整段裁掉，否则整段选中；`k--` 消化的是「当前串自身」那一位。时间复杂度为 $O(26n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    ll k;
    cin >> s >> k;
    int n = s.size();
    struct S {
        int nxt[26];
        int link = -1, len = 0;
        S() { memset(nxt, -1, sizeof nxt); }
    };
    vector<S> st(2 * n + 5);
    int sz = 1, last = 0;
    for (char c : s) {
        int cur = sz++;
        st[cur].len = st[last].len + 1;
        int p = last;
        while (p != -1 && st[p].nxt[c - 'a'] < 0) {
            st[p].nxt[c - 'a'] = cur;
            p = st[p].link;
        }
        if (p == -1)
            st[cur].link = 0;
        else {
            int q = st[p].nxt[c - 'a'];
            if (st[p].len + 1 == st[q].len)
                st[cur].link = q;
            else {
                int cl = sz++;
                st[cl] = st[q];
                st[cl].len = st[p].len + 1;
                while (p != -1 && st[p].nxt[c - 'a'] == q) {
                    st[p].nxt[c - 'a'] = cl;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = cl;
            }
        }
        last = cur;
    }
    vector<int> cnt(st[last].len + 1, 0);
    for (int i = 1; i < sz; i++) cnt[st[i].len]++;
    for (int i = 1; i <= st[last].len; i++) cnt[i] += cnt[i - 1];
    vector<int> order(sz);
    for (int i = 1; i < sz; i++) order[--cnt[st[i].len]] = i;
    vector<ll> ways(sz);
    for (int i = sz - 1; i >= 0; i--) {
        int v = order[i];
        if (v == 0)
            continue;
        ways[v] = 1;
        for (int c = 0; c < 26; c++)
            if (st[v].nxt[c] >= 0)
                ways[v] += ways[st[v].nxt[c]];
    }
    int v = 0;
    string ans;
    while (k > 0) {
        for (int c = 0; c < 26; c++) {
            int u = st[v].nxt[c];
            if (u < 0)
                continue;
            if (k > ways[u])
                k -= ways[u];
            else {
                ans += char('a' + c);
                v = u;
                k--;
                break;
            }
        }
    }
    cout << ans << '\n';
}
```

:::

### Substring Order II


**题目大意**：把字符串 `s`（$|s| \le 10^5$）的所有子串（**含重复**，每个出现位置算一次）按字典序排序，输出第 `k` 小的子串。

**解题思路**：

- **做法**：建后缀自动机后先统计出现次数 `occ`：把每个前缀对应的状态置 1，再沿长度拓扑序倒序把 `occ` 累加到 `link` 上。`ways[v] = occ[v] +` 所有后继字符的 `ways` 之和：`occ[v]` 是「就停在这里」的那批条目——同一个串的每次出现各占一位，故有 `occ[v]` 个。求第 `k` 小：从根出发，状态 `v != 0` 时先判断 `k <= occ[v]`，成立则当前已拼出的串就是答案；否则 `k -= occ[v]`，再按 `a..z` 试边，`k > ways[u]` 就 `k -= ways[u]` 跳过，否则走到 `u`；选定字符后不需要 `k--`，因为「当前串自身」的条目已经由 `occ` 计入。

- **正确性**：同一状态代表的所有子串共享同一个 endpos 集合，出现次数都等于 `occ[v]`，因此「以当前前缀为串本体」的条目恰有 `occ[v]` 个，且都排在以它为前缀的更长子串之前。按字符升序枚举边时同一分支的条目连续，`k > ways[u]` 的整段跳过、否则落在段内继续推进，定位到的正是第 `k` 小的子串。时间复杂度为 $O(26n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    ll k;
    cin >> s >> k;
    int n = s.size();
    struct S {
        int nxt[26];
        int link = -1, len = 0;
        S() { memset(nxt, -1, sizeof nxt); }
    };
    vector<S> st(2 * n + 5);
    int sz = 1, last = 0;
    for (char c : s) {
        int cur = sz++;
        st[cur].len = st[last].len + 1;
        int p = last;
        while (p != -1 && st[p].nxt[c - 'a'] < 0) {
            st[p].nxt[c - 'a'] = cur;
            p = st[p].link;
        }
        if (p == -1)
            st[cur].link = 0;
        else {
            int q = st[p].nxt[c - 'a'];
            if (st[p].len + 1 == st[q].len)
                st[cur].link = q;
            else {
                int cl = sz++;
                st[cl] = st[q];
                st[cl].len = st[p].len + 1;
                while (p != -1 && st[p].nxt[c - 'a'] == q) {
                    st[p].nxt[c - 'a'] = cl;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = cl;
            }
        }
        last = cur;
    }
    vector<int> occ(sz);
    for (int p = 0, i = 0; i < n; i++) {
        p = st[p].nxt[s[i] - 'a'];
        occ[p]++;
    }
    vector<int> cnt(st[last].len + 1, 0);
    for (int i = 1; i < sz; i++) cnt[st[i].len]++;
    for (int i = 1; i <= st[last].len; i++) cnt[i] += cnt[i - 1];
    vector<int> order(sz);
    for (int i = 1; i < sz; i++) order[--cnt[st[i].len]] = i;
    for (int i = sz - 1; i >= 0; i--) {
        int v = order[i];
        if (v == 0)
            continue;
        occ[st[v].link] += occ[v];
    }
    vector<ll> ways(sz);
    for (int i = sz - 1; i >= 0; i--) {
        int v = order[i];
        if (v == 0)
            continue;
        ways[v] = occ[v];
        for (int c = 0; c < 26; c++)
            if (st[v].nxt[c] >= 0)
                ways[v] += ways[st[v].nxt[c]];
    }
    int v = 0;
    string ans;
    while (k > 0) {
        if (v != 0) {
            if (k <= occ[v])
                break;
            k -= occ[v];
        }
        bool moved = false;
        for (int c = 0; c < 26; c++) {
            int u = st[v].nxt[c];
            if (u < 0)
                continue;
            if (k > ways[u])
                k -= ways[u];
            else {
                ans += char('a' + c);
                v = u;
                moved = true;
                break;
            }
        }
        if (!moved)
            break;
    }
    cout << ans << '\n';
}
```

:::

### Substring Distribution


**题目大意**：对每个长度 `L = 1..n`（$n \le 10^5$），输出字符串 `s` 的长度为 `L` 的不同子串个数。

**解题思路**：建后缀自动机后，每个状态 `v` 贡献的正是一组长度落在 $[\operatorname{len}(\operatorname{link}(v))+1, \operatorname{len}(v)]$ 内、且每个长度恰好一个的不同子串，不同状态之间互不重复。用差分数组 `diff` 把每个状态的这段区间累加：`diff[len[link[v]] + 1]++`、`diff[len[v] + 1]--`（数组开 `n+2` 位，容纳 `len[v] + 1 = n + 1` 时的减记号）；从 `L = 1` 到 `n` 依次做前缀和，得到的 `diff[L]` 就是长度为 `L` 的不同子串个数。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    struct S {
        int nxt[26];
        int link = -1, len = 0;
        S() { memset(nxt, -1, sizeof nxt); }
    };
    vector<S> st(2 * n + 5);
    int sz = 1, last = 0;
    for (char c : s) {
        int cur = sz++;
        st[cur].len = st[last].len + 1;
        int p = last;
        while (p != -1 && st[p].nxt[c - 'a'] < 0) {
            st[p].nxt[c - 'a'] = cur;
            p = st[p].link;
        }
        if (p == -1)
            st[cur].link = 0;
        else {
            int q = st[p].nxt[c - 'a'];
            if (st[p].len + 1 == st[q].len)
                st[cur].link = q;
            else {
                int cl = sz++;
                st[cl] = st[q];
                st[cl].len = st[p].len + 1;
                while (p != -1 && st[p].nxt[c - 'a'] == q) {
                    st[p].nxt[c - 'a'] = cl;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = cl;
            }
        }
        last = cur;
    }
    vector<int> diff(n + 2);
    for (int i = 1; i < sz; i++) {
        diff[st[st[i].link].len + 1]++;
        diff[st[i].len + 1]--;
    }
    int cur = 0;
    for (int i = 1; i <= n; i++) {
        cur += diff[i];
        cout << cur << ' ';
    }
    cout << '\n';
}
```

:::

## Geometry

### Point Location Test


**题目大意**：`t` 组测试（$t \le 10^5$），每组给出两个不同的点 $p_1=(x_1,y_1)$、$p_2=(x_2,y_2)$ 确定一条直线，以及第三个点 $p_3=(x_3,y_3)$，所有坐标的绝对值可达 $10^9$。判断从 $p_1$ 看向 $p_2$ 时 $p_3$ 位于直线的左侧、右侧还是直线上，分别输出 `LEFT`、`RIGHT`、`TOUCH`。

**解题思路**：用叉积定向。二维向量外积 $\vec{u}\times\vec{v}=u_xv_y-u_yv_x$ 的符号表示 $\vec{v}$ 相对 $\vec{u}$ 是逆时针还是顺时针。代码计算 `c = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)`，即 $\overrightarrow{p_1p_2}\times\overrightarrow{p_1p_3}$：`c > 0` 表示 $p_3$ 在 $p_1 \to p_2$ 方向的左侧（逆时针一侧），`c < 0` 表示在右侧，`c == 0` 表示三点共线（$p_3$ 落在直线上）。坐标差不超过 $2\times10^9$，两个乘积各不超过 $4\times10^{18}$，`ll` 不溢出。每组的时间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    ll x1, y1, x2, y2, x3, y3;
    cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
    ll c = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    if (c > 0)
        cout << "LEFT\n";
    else if (c < 0)
        cout << "RIGHT\n";
    else
        cout << "TOUCH\n";
}
```

:::

### Line Segment Intersection


**题目大意**：`t` 组测试（$t \le 10^5$），每组给出两条线段的端点 $p_1,p_2$ 与 $p_3,p_4$，坐标绝对值可达 $10^9$。判断两条线段是否有公共点（相交以及端点相接都算），有则输出 `YES`，否则输出 `NO`。

**解题思路**：

- **观察**：两条线段有公共点，当且仅当两者「跨立」——每条线段的两端点分别落在另一条线段所在直线的严格两侧；或者存在一个端点落在另一条线段上，即叉积为 0 且该点在线段范围内。

- **做法**：`cr(ax, ay, bx, by, cx, cy)` 返回 $\overrightarrow{ab}\times\overrightarrow{ac}$，其符号表示点 `c` 在直线 `a→b` 的哪一侧。代码取 `d1 = cr(p3, p4, p1)`、`d2 = cr(p3, p4, p2)`（$p_1,p_2$ 相对直线 $p_3p_4$ 的位置）与 `d3 = cr(p1, p2, p3)`、`d4 = cr(p1, p2, p4)`（$p_3,p_4$ 相对直线 $p_1p_2$ 的位置）；`d1`、`d2` 严格异号说明 $p_1,p_2$ 分居直线 $p_3p_4$ 两侧，`d3`、`d4` 严格异号说明 $p_3,p_4$ 分居直线 $p_1p_2$ 两侧，两组同时成立即判定相交。任一端点处叉积为 0 时，用 `onSeg` 补一次判定：先由叉积为 0 确认共线，再检查该点的 `x`、`y` 坐标都落在另一线段两端点的同名坐标之间（含端点）。

- **边界**：共线情形只靠叉积为 0 会把「共线但落在线段外」的点误判为相交，故四个 `d` 中任一为 0 都必须走 `onSeg`。坐标差不超过 $2\times10^9$，叉积不超过 $4\times10^{18}$，`ll` 足够。每组的时间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
ll cr(ll ax, ll ay, ll bx, ll by, ll cx, ll cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
bool onSeg(ll ax, ll ay, ll bx, ll by, ll px, ll py) {
    if (cr(ax, ay, bx, by, px, py) != 0)
        return false;
    return min(ax, bx) <= px && px <= max(ax, bx) && min(ay, by) <= py &&
           py <= max(ay, by);
}
void solve() {
    ll x1, y1, x2, y2, x3, y3, x4, y4;
    cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3 >> x4 >> y4;
    ll d1 = cr(x3, y3, x4, y4, x1, y1), d2 = cr(x3, y3, x4, y4, x2, y2);
    ll d3 = cr(x1, y1, x2, y2, x3, y3), d4 = cr(x1, y1, x2, y2, x4, y4);
    bool ok = false;
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)))
        ok = true;
    if (d1 == 0 && onSeg(x3, y3, x4, y4, x1, y1))
        ok = true;
    if (d2 == 0 && onSeg(x3, y3, x4, y4, x2, y2))
        ok = true;
    if (d3 == 0 && onSeg(x1, y1, x2, y2, x3, y3))
        ok = true;
    if (d4 == 0 && onSeg(x1, y1, x2, y2, x4, y4))
        ok = true;
    cout << (ok ? "YES\n" : "NO\n");
}
```

:::

### Polygon Area


**题目大意**：给定简单多边形的 `n` 个顶点（$n \le 1000$，顶点按顺序给出，坐标绝对值 $\le 10^9$），输出多边形面积的 2 倍（保证为整数）。

**解题思路**：鞋带公式：相邻顶点两两作叉积求和，$2S=\left|\sum_i\left(x_i y_{i+1}-x_{i+1}y_i\right)\right|$，下标对 `n` 循环（代码里 `j = (i + 1) % n`），累加值 `s` 就是有向面积的 2 倍，取绝对值后输出。每一项是一个三角形有向面积的 2 倍；顶点全为整点，所以 `s` 必为整数，整个计算只有整数乘法与加法、不出现除法，也就不会引入浮点误差——这正是题目要求输出 2 倍面积的原因。多边形落在 $[-10^9,10^9]^2$ 内，$2S \le 8\times10^{18}$，`ll` 足够。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    ll s = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        s += x[i] * y[j] - x[j] * y[i];
    }
    cout << llabs(s) << '\n';
}
```

:::

### Point in Polygon


**题目大意**：给定一个 `n` 顶点的简单多边形（$n, m \le 1000$，顶点按顺序给出）与 `m` 个询问点，对每个点判断它在多边形内部、边界上还是外部，分别输出 `INSIDE`、`BOUNDARY`、`OUTSIDE`。

**解题思路**：

- **观察**：从询问点向 `x` 轴正方向作水平射线，射线与多边形边界的交点个数为奇数则点在内部、偶数则在外部；点落在边界上是另一种情况，单独判定。

- **做法**：先逐边用 `onSeg` 判断点是否在边上（叉积为 0 且坐标都在端点范围内，含端点），是则输出 BOUNDARY。否则统计交点：只处理恰好一个端点在射线上方的边，判据写作 `(y[i] > py) != (y[j] > py)`，水平边被自然排除、真正跨过射线的边只计一次。交点是否位于询问点右侧不做除法，而是把「交点横坐标大于 $p_x$」两边同乘 $y_j-y_i$，化为 `lhs = (x[j] - x[i]) * (py - y[i])` 与 `rhs = (px - x[i]) * (y[j] - y[i])` 的比较；乘数为负时不等号翻转，故代码按 `y[j] > y[i]` 分别取 `lhs > rhs` 或 `lhs < rhs`，`right` 为真则计数加 1。

- **正确性**：半开判据 `(y[i] > py) != (y[j] > py)` 使每条与射线真正相交的边恰好贡献 1 个交点，经过端点的边不会被重复计数，计数奇偶性就等于内外性。时间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
ll cr(ll ax, ll ay, ll bx, ll by, ll px, ll py) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}
bool onSeg(ll ax, ll ay, ll bx, ll by, ll px, ll py) {
    if (cr(ax, ay, bx, by, px, py) != 0)
        return false;
    return min(ax, bx) <= px && px <= max(ax, bx) && min(ay, by) <= py &&
           py <= max(ay, by);
}
void solve() {
    int n, m;
    cin >> n >> m;
    vector<ll> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    while (m--) {
        ll px, py;
        cin >> px >> py;
        bool bound = false;
        int cnt = 0;
        for (int i = 0; i < n; i++) {
            int j = (i + 1) % n;
            if (onSeg(x[i], y[i], x[j], y[j], px, py)) {
                bound = true;
                break;
            }
            if ((y[i] > py) != (y[j] > py)) {
                ll lhs = (x[j] - x[i]) * (py - y[i]);
                ll rhs = (px - x[i]) * (y[j] - y[i]);
                bool right = (y[j] > y[i]) ? lhs > rhs : lhs < rhs;
                if (right)
                    cnt++;
            }
        }
        if (bound)
            cout << "BOUNDARY\n";
        else if (cnt % 2 == 1)
            cout << "INSIDE\n";
        else
            cout << "OUTSIDE\n";
    }
}
```

:::

### Polygon Lattice Points


**题目大意**：给定顶点均为整点的简单多边形（$n \le 1000$，顶点按顺序给出，坐标绝对值 $\le 10^6$），输出内部的格点数与边界上的格点数。

**解题思路**：

- **观察**：Pick 定理——顶点全为整点的简单多边形满足 $S=I+\frac{B}{2}-1$，其中 `I` 为内部格点数、`B` 为边界格点数。

- **做法**：边界格点数逐边累加。两端点为整点的线段上格点数为 $\gcd(|dx|,|dy|)+1$，代码对每条边累加 `gcd(llabs(x[i] - x[j]), llabs(y[i] - y[j]))`，即只计该边格点数减一（少算一个端点）；绕多边形一圈后每个边界格点恰好被计一次，不重不漏，得到 `B`。`s` 为鞋带公式的 2S，由 $I=S-\frac{B}{2}+1$ 得 `(s - B) / 2 + 1`，与 `B` 一起输出。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    ll s = 0, B = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        s += x[i] * y[j] - x[j] * y[i];
        B += gcd(llabs(x[i] - x[j]), llabs(y[i] - y[j]));
    }
    s = llabs(s);
    cout << (s - B) / 2 + 1 << ' ' << B << '\n';
}
```

:::

### Minimum Euclidean Distance


**题目大意**：给定平面上 `n` 个互不相同的整点（$n \le 2 \times 10^5$，坐标绝对值 $\le 10^9$），输出最近两点欧氏距离的平方。

**解题思路**：

- **观察**：最近点对的条带结论——按 `x` 排序依次扫描，设已求得的最小距离平方为 `best`，则 `x` 坐标之差已超过 $\sqrt{best}$ 的点不可能再更新答案，只需保留 `x` 差不超过 $\sqrt{best}$ 的活跃点。经典分治写法在合并时按 `y` 序遍历中线条带；代码用扫描线加按 `y` 有序的集合实现同一结论。

- **做法**：把点按 `(x, y)` 排序。集合 `s` 以 `{y, x}` 为键维护活跃点，条带宽度取 `d = floor(sqrt(best)) + 1`。处理 `p[i]` 时先把 `p[i].first - p[j].first > d` 的旧点逐个从集合中删除，再在集合中取 `y` 落在 `[p[i].second - d, p[i].second + d]` 内的点，逐一用 `dx * dx + dy * dy` 更新 `best`，最后把当前点插入集合；`best` 初值为 `LLONG_MAX`。

- **正确性**：若 $dx > d = \lfloor\sqrt{best}\rfloor+1$，则 $dx \ge d+1 > \sqrt{best}$，从而 $dx^2 > best$，这样的点对不可能更新答案；删除只会发生一次且后续点的 `x` 更大，`best` 只减不增使条带只会变窄，被删的点无需恢复。条带内每个点至多与常数个候选点比较（几何打包论证），总比较次数为 $O(n)$。总时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<pair<ll, ll>> p(n);
    for (int i = 0; i < n; i++) cin >> p[i].first >> p[i].second;
    sort(p.begin(), p.end());
    set<pair<ll, ll>> s;
    ll best = LLONG_MAX;
    int j = 0;
    for (int i = 0; i < n; i++) {
        ll d = (ll)sqrtl((long double)best) + 1;
        while (p[i].first - p[j].first > d) {
            s.erase({p[j].second, p[j].first});
            j++;
        }
        auto it = s.lower_bound({p[i].second - d, LLONG_MIN});
        while (it != s.end() && it->first <= p[i].second + d) {
            ll dx = p[i].first - it->second, dy = p[i].second - it->first;
            best = min(best, dx * dx + dy * dy);
            it++;
        }
        s.insert({p[i].second, p[i].first});
    }
    cout << best << '\n';
}
```

:::

### Convex Hull


**题目大意**：给定平面上的 `n` 个点（$n \le 2 \times 10^5$，坐标绝对值 $\le 10^9$），构造凸包并输出凸包上的所有点——落在凸包边内部的共线点也要输出，先输出点数，再按任意顺序输出这些点。

**解题思路**：

- **观察**：凸包是包含全部点的最小凸多边形。本题要求输出边界上的所有点，因此弹栈判据必须取**严格右转**（叉积 `< 0`）：叉积为 0 表示三点共线，共线点位于凸包边上、属于答案；若写成 `<= 0`，共线的中间点会被弹出，输出就少了这些点。

- **做法**：Andrew 单调链。先把点按 `(x, y)` 排序并 `unique` 去重，再从左到右构造下凸壳：向栈 `h` 压入点之前，只要栈顶两点与新点 `q` 构成严格右转（`cr(h[h.size() - 2], h.back(), q) < 0`）就弹出栈顶，栈内从左到右因此始终是下凸壳；接着从右到左构造上凸壳，弹栈条件中加入 `(int)h.size() > low`（`low` 为下凸壳结束时的栈大小），避免把已建好的下凸壳弹掉；最后 `h.pop_back()` 去掉重复的起点。

- **边界**：去重后点数不超过 2，或者全部点共线时，两遍扫描会把中间点重复压栈，故先用 `cr(p[0], p[1], p[i]) != 0` 判断是否全共线，这两种情形都直接把全部点原样输出。时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
ll cr(pair<ll, ll> a, pair<ll, ll> b, pair<ll, ll> c) {
    return (b.first - a.first) * (c.second - a.second) -
           (b.second - a.second) * (c.first - a.first);
}
void solve() {
    int n;
    cin >> n;
    vector<pair<ll, ll>> p(n);
    for (int i = 0; i < n; i++) cin >> p[i].first >> p[i].second;
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    int nn = (int)p.size();
    if (nn <= 2) {
        cout << nn << '\n';
        for (auto& q : p) cout << q.first << ' ' << q.second << '\n';
        return;
    }
    bool collinear = true;
    for (int i = 2; i < nn; i++)
        if (cr(p[0], p[1], p[i]) != 0) {
            collinear = false;
            break;
        }
    if (collinear) {
        cout << nn << '\n';
        for (auto& q : p) cout << q.first << ' ' << q.second << '\n';
        return;
    }

    vector<pair<ll, ll>> h;
    for (auto& q : p) {
        while (h.size() >= 2 && cr(h[h.size() - 2], h.back(), q) < 0)
            h.pop_back();
        h.push_back(q);
    }
    int low = h.size();
    for (int i = nn - 2; i >= 0; i--) {
        auto q = p[i];
        while ((int)h.size() > low && cr(h[h.size() - 2], h.back(), q) < 0)
            h.pop_back();
        h.push_back(q);
    }
    h.pop_back();
    cout << h.size() << '\n';
    for (auto& q : h) cout << q.first << ' ' << q.second << '\n';
}
```

:::

### Maximum Manhattan Distances


**题目大意**：一个集合最初为空，依次加入 `n` 个点，每次加入后输出当前集合中任意两点的最大曼哈顿距离。

**解题思路**：作 45° 坐标变换 $u=x+y$、$v=x-y$。对任意两点有 $|x_1-x_2|+|y_1-y_2|=\max\left(|u_1-u_2|,|v_1-v_2|\right)$：取 $a=x_1-x_2$、$b=y_1-y_2$，由 $|a|+|b|=\max(|a+b|,|a-b|)$ 即得（同号时 $|a+b|=|a|+|b|$，异号时 $|a-b|=|a|+|b|$）。于是集合内最大曼哈顿距离等于 $\max(\max u-\min u,\ \max v-\min v)$，只需增量维护四个量：$x+y$ 的最大值 `mxp`、最小值 `mnp` 与 $x-y$ 的最大值 `mxm`、最小值 `mnm`。每加入一个点更新这四个值，输出 `max(mxp - mnp, mxm - mnm)`。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    ll mxp = LLONG_MIN, mnp = LLONG_MAX, mxm = LLONG_MIN, mnm = LLONG_MAX;
    for (int i = 0; i < n; i++) {
        ll x, y;
        cin >> x >> y;
        mxp = max(mxp, x + y);
        mnp = min(mnp, x + y);
        mxm = max(mxm, x - y);
        mnm = min(mnm, x - y);
        cout << max(mxp - mnp, mxm - mnm) << '\n';
    }
}
```

:::

### All Manhattan Distances


**题目大意**：给定 `n` 个点，求所有点对曼哈顿距离之和。坐标绝对值可达 $10^9$，答案可能超出 64 位。

**解题思路**：曼哈顿距离的 `x`、`y` 分量相互独立，分别求和再相加。把 `x` 坐标排序后，第 `i` 小（下标从 0 起）的坐标在 `i` 个点对中充当被减数、在 `n - 1 - i` 个点对中充当减数，故它对总和的贡献为 $x_i\cdot\left(i-(n-1-i)\right)=x_i\cdot(2i-n+1)$；`y` 同理。答案可达 $\Theta(n^2\cdot10^9)$ 量级、超出 64 位，代码用 `__int128` 累加，输出时手写十进制转换（`__int128` 不能直接流输出），答案为 0 时特判输出 `0`。时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    __int128 ans = 0;
    sort(x.begin(), x.end());
    sort(y.begin(), y.end());
    for (int i = 0; i < n; i++) {
        ans += (__int128)x[i] * i - (__int128)x[i] * (n - 1 - i);
        ans += (__int128)y[i] * i - (__int128)y[i] * (n - 1 - i);
    }

    string out;
    while (ans) {
        out += char('0' + ans % 10);
        ans /= 10;
    }
    reverse(out.begin(), out.end());
    cout << (out.empty() ? "0" : out) << '\n';
}
```

:::

### Intersection Points


**题目大意**：给定 `n` 条水平或竖直线段（水平线段 $x_1 < x_2$，竖直线段 $y_1 < y_2$），保证任意两条同方向的线段不相交、且线段的端点都不是交点。求交点总数。

**解题思路**：

- **观察**：沿 `x` 轴扫描，维护与扫描线相交的「活跃」水平线段在 `y` 轴上的分布；遇到竖直线段时，活跃水平线段中 `y` 落在这条竖直线段 $[y_1,y_2]$ 内的个数就是它与该竖直线段的交点数。

- **做法**：每条水平线段拆成左端点处的 `ADD` 与右端点处的 `REMOVE` 事件，每条竖直线段在它的 `x` 处产生一个 `QUERY` 事件，所有事件按 `x` 排序；`enum { QUERY, ADD, REMOVE }` 使同一 `x` 处 `QUERY` 排在最前。`y` 坐标先离散化，线段树 `Tree` 按 `y` 的下标维护活跃水平线段条数：水平线段的两个 `y` 相同，`ADD`/`REMOVE` 是单点 `+1`/`-1`；`QUERY` 对 `[y1, y2]` 的压缩下标区间求和并累加进 `ans`。

- **正确性**：处理某条竖直线段时，树中恰好是所有覆盖该 `x` 的水平线段，区间求和统计的是端点落在 $[y_1,y_2]$ 内的那些；由「端点不是交点」可知端点处的退化相交不会出现，因此计数不重不漏。总时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
struct Tree {
    int n;
    vector<int> tree;

    Tree(int k) {
        n = 1;
        while (n < k) n *= 2;
        tree.assign(n * 2, 0);
    }

    void add(int k, int x) {
        k += n;
        tree[k] += x;
        while (k > 1) {
            k /= 2;
            tree[k] = tree[k * 2] + tree[k * 2 + 1];
        }
    }

    int query(int l, int r) {
        int sum = 0;
        for (l += n, r += n; l <= r; l /= 2, r /= 2) {
            if (l % 2 == 1)
                sum += tree[l++];
            if (r % 2 == 0)
                sum += tree[r--];
        }
        return sum;
    }
};

enum { QUERY, ADD, REMOVE };

void solve() {
    int n;
    cin >> n;

    vector<int> y_values;
    vector<tuple<int, int, int, int>> events;

    for (int i = 0; i < n; ++i) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;

        y_values.push_back(y1);
        y_values.push_back(y2);

        if (y1 == y2) {
            events.emplace_back(x1, ADD, y1, y2);
            events.emplace_back(x2, REMOVE, y1, y2);
        } else {
            events.emplace_back(x1, QUERY, y1, y2);
        }
    }

    sort(events.begin(), events.end());
    sort(y_values.begin(), y_values.end());
    y_values.erase(unique(y_values.begin(), y_values.end()), y_values.end());

    auto index = [&](int y) {
        auto it = lower_bound(y_values.begin(), y_values.end(), y);
        return distance(y_values.begin(), it);
    };

    Tree tree(y_values.size());
    ll ans = 0;

    for (auto [x, type, y1, y2] : events) {
        y1 = index(y1);
        y2 = index(y2);
        if (type == ADD) {
            tree.add(y1, 1);
        } else if (type == REMOVE) {
            tree.add(y1, -1);
        } else {
            ans += tree.query(y1, y2);
        }
    }

    cout << ans << '\n';
}
```

:::

### Line Segments Trace I


**题目大意**：`n` 条线段，左端点 `x` 坐标均为 0、右端点均为 `m`，且斜率都是整数（坐标绝对值可达 $10^9$）。对每个整数 $x \in [0, m]$，输出所有线段在该 `x` 处的最大 `y` 值。

**解题思路**：

- **观察**：每条线段在 $[0,m]$ 上就是一条完整直线 $y=kx+b$（整数斜率 `k = (y2 - y1) / m`、截距 `b = y1`）。对每个 `x` 求直线族在该点的最大值，就是求上包络的逐点取值，用 Li Chao 树处理。

- **做法**：每个节点存一条「在该区间内可能取到最大值」的直线。插入 `add(node, l, r, nw)` 先把新直线 `nw` 与节点直线在中点 `mid` 处比较，若 `f(tr[node], mid) < f(nw, mid)` 则交换，使中点处较优的直线留在 `tr[node]`；两条直线最多相交一次，较劣的那条至多在交点所在的一侧仍可能更优，代码依次检查 `f(lo, l) < f(hi, l)` 与 `f(lo, r) < f(hi, r)`，把较劣直线递归下放到相应的儿子。查询 `qry` 从根走到叶子，路径上每个节点的直线都可能在该点最优，逐层取 `f` 的最大值即为答案；`Line` 的默认参数让空节点的取值为极小的 `NEG`，不影响取最大。时间复杂度为 $O((n+m)\log m)$。

:::details[题解(C++)]

```c++
const ll NEG = -4e18;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = NEG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * 100005];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) < f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) < f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) < f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return max(res, qry(node << 1, l, mid, x));
    return max(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        ll y1, y2;
        cin >> y1 >> y2;
        ll k = (y2 - y1) / m;
        add(1, 0, m, Line(k, y1));
    }
    for (int x = 0; x <= m; x++) cout << qry(1, 0, m, x) << ' ';
    cout << '\n';
}
```

:::

### Line Segments Trace II


**题目大意**：`n` 条线段，端点 `x` 坐标都在 $[0, m]$ 内、斜率均为整数。对每个整数 $x \in [0, m]$，输出覆盖该 `x` 的线段中的最大 `y` 值；没有任何线段覆盖时输出 -1。

**解题思路**：

- **观察**：每条线段只在一个 `x` 区间上有效——线段两端为 $(x_1,y_1)$、$(x_2,y_2)$，所在直线为 $y=ax+b$，其中 `a = (y2 - y1) / (x2 - x1)`、`b = y1 - a * x1`，但它只能在 $[x_1,x_2]$ 上参与取最大值，对应 Li Chao 树的**区间插入**。

- **做法**：`addRange(node, l, r, ql, qr, nw)` 把 $[ql,qr]$ 递归拆成 $O(\log m)$ 个被完全覆盖的节点，在每个这样的节点上对 `nw` 调用一次普通 `add`；`add` 比较区间中点处两条直线的取值，把较优者留在 `tr[node]`，再把较劣者下放——两直线最多相交一次，故按 `f(lo, l) < f(hi, l)` 或 `f(lo, r) < f(hi, r)` 决定下放到左儿子还是右儿子。点查询 `qry` 沿根到叶的路径，对路径上每个节点存的直线在 `x` 处取最大值。

- **边界**：`Line` 的默认参数使空节点取值为 `NEG`，若 `qry` 的结果仍是 `NEG`，说明该点没有任何线段覆盖，输出 -1。斜率为整数意味着不会出现 $x_1=x_2$ 的竖直线段（代码中的跳过只是防御性处理）。总时间复杂度为 $O(n\log^2 m + m\log m)$。

:::details[题解(C++)]

```c++
const ll NEG = -4e18;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = NEG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * 100005];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) < f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) < f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) < f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
void addRange(int node, int l, int r, int ql, int qr, Line nw) {
    if (qr < l || r < ql)
        return;
    if (ql <= l && r <= qr) {
        add(node, l, r, nw);
        return;
    }
    int mid = (l + r) >> 1;
    addRange(node << 1, l, mid, ql, qr, nw);
    addRange(node << 1 | 1, mid + 1, r, ql, qr, nw);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return max(res, qry(node << 1, l, mid, x));
    return max(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        ll x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        if (x1 == x2)
            continue;
        ll a = (y2 - y1) / (x2 - x1);
        ll b = y1 - a * x1;
        addRange(1, 0, m, (int)x1, (int)x2, Line(a, b));
    }
    for (int x = 0; x <= m; x++) {
        ll v = qry(1, 0, m, x);
        if (v == NEG)
            cout << -1 << ' ';
        else
            cout << v << ' ';
    }
    cout << '\n';
}
```

:::

### Lines and Queries I


**题目大意**：依次处理 `n` 个操作，每个操作形如 `1 a b`（加入直线 $y=ax+b$）或 `2 x`（询问 `x` 处所有已加入直线中的最大 `y` 值，$0 \le x \le 10^5$）；对每个询问输出答案，保证第一个操作是加入直线。

**解题思路**：

- **观察**：直线只增不减、查询只问单点，用 Li Chao 树维护直线族的上包络即可。

- **做法**：线段树的下标区间取 $[0, \text{XMAX}]$（`XMAX = 100000`），每个节点 `tr[node]` 存一条直线。插入 `add(1, 0, XMAX, Line(a, b))`：先比较区间中点 `mid` 处节点直线与新直线的取值，把较优者留在节点上；较劣者至多在交点所在的一侧仍可能更优，故按 `f(lo, l) < f(hi, l)`、`f(lo, r) < f(hi, r)` 递归下放到对应子树，直到叶节点。查询 `qry` 从根走到叶子，把路径上每条节点直线在该 `x` 处的取值取最大；空节点存的是默认直线 `Line(0, NEG)`，取值极小，不影响结果，且首个操作必为加入直线，查询时树中至少有一条直线。时间复杂度为 $O(n\log \text{XMAX})$。

:::details[题解(C++)]

```c++
const ll NEG = -4e18;
const int XMAX = 100000;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = NEG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * (XMAX + 5)];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) < f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) < f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) < f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return max(res, qry(node << 1, l, mid, x));
    return max(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n;
    cin >> n;                    // 先读操作个数，再依次处理
    while (n--) {
        int t;
        cin >> t;
        if (t == 1) {
            ll a, b;
            cin >> a >> b;
            add(1, 0, XMAX, Line(a, b));
        } else {
            ll x;
            cin >> x;
            cout << qry(1, 0, XMAX, (int)x) << '\n';
        }
    }
}
```

:::

### Lines and Queries II


**题目大意**：依次处理 `n` 个操作，每个操作形如 `1 a b l r`（加入直线 $y=ax+b$，它只在 $[l,r]$ 内有效，$0 \le l \le r \le 10^5$）或 `2 x`（询问 `x` 处所有有效直线中的最大 `y` 值，$0 \le x \le 10^5$）；没有任何有效直线时输出 `NO`。

**解题思路**：

- **做法**：Li Chao 树的区间插入加单点查询。`addRange(node, l, r, ql, qr, nw)` 把 $[ql,qr]$ 递归拆成 $O(\log \text{XMAX})$ 个被完全覆盖的节点，在每个节点上对 `nw` 调用一次普通 `add`：`add` 比较区间中点处节点直线与 `nw` 的取值，较优者留在 `tr[node]`，较劣者按 `f(lo, l) < f(hi, l)`、`f(lo, r) < f(hi, r)` 下放到交点所在的一侧子树。点查询 `qry` 沿根到叶的路径，对每个节点存的直线在 `x` 处取最大值；`Line` 的默认参数让空节点取值为 `NEG`，结果为 `NEG` 即该点没有任何直线有效。

- **正确性**：区间插入把直线登记在所有被 $[ql,qr]$ 完整覆盖的节点上，被下放的直线也只在可能翻盘的一侧继续登记，因此根到叶路径上的取最大值不会遗漏任何在该点有效的直线；`NEG` 小于任何真实取值，故用它判定「无直线覆盖」是精确的。总时间复杂度为 $O(n\log^2 \text{XMAX})$。

:::details[题解(C++)]

```c++
const ll NEG = -4e18;
const int XMAX = 100000;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = NEG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
Line tr[4 * (XMAX + 5)];
void add(int node, int l, int r, Line nw) {
    int mid = (l + r) >> 1;
    Line lo = tr[node], hi = nw;
    if (f(lo, mid) < f(hi, mid))
        swap(lo, hi);
    tr[node] = lo;
    if (l == r)
        return;
    if (f(lo, l) < f(hi, l))
        add(node << 1, l, mid, hi);
    else if (f(lo, r) < f(hi, r))
        add(node << 1 | 1, mid + 1, r, hi);
}
void addRange(int node, int l, int r, int ql, int qr, Line nw) {
    if (qr < l || r < ql)
        return;
    if (ql <= l && r <= qr) {
        add(node, l, r, nw);
        return;
    }
    int mid = (l + r) >> 1;
    addRange(node << 1, l, mid, ql, qr, nw);
    addRange(node << 1 | 1, mid + 1, r, ql, qr, nw);
}
ll qry(int node, int l, int r, int x) {
    ll res = f(tr[node], x);
    if (l == r)
        return res;
    int mid = (l + r) >> 1;
    if (x <= mid)
        return max(res, qry(node << 1, l, mid, x));
    return max(res, qry(node << 1 | 1, mid + 1, r, x));
}
void solve() {
    int n;
    cin >> n;                    // 先读操作个数，再依次处理
    while (n--) {
        int t;
        cin >> t;
        if (t == 1) {
            ll a, b, l, r;
            cin >> a >> b >> l >> r;
            addRange(1, 0, XMAX, (int)l, (int)r, Line(a, b));
        } else {
            ll x;
            cin >> x;
            ll v = qry(1, 0, XMAX, (int)x);
            if (v == NEG)
                cout << "NO\n";
            else
                cout << v << '\n';
        }
    }
}
```

:::

### Area of Rectangles


**题目大意**：给定 `n` 个矩形（边平行于坐标轴，坐标在 $[-10^6, 10^6]$ 内），求它们并集的面积。

**解题思路**：

- **观察**：把并集面积化成扫描线问题——沿 `x` 逐列统计被覆盖的 `y` 格子数，累加起来就是面积。

- **做法**：把 `y` 坐标统一加偏移 $M+1$（$M=10^6+2$）映射到 $[3,\ 2\times10^6+3]$，线段树建在下标 $[1, N-2]$（$N=2\times10^6+7$）上；每个节点维护区间覆盖次数的最小值 `Min` 与取到该最小值的格子数 `cnt`。由于映射后两端各留下永不被覆盖的格子，全局最小值恒为 0，`tr[1].cnt` 就是未覆盖格子数，该列被覆盖的格子数为 $N-2-tr[1].cnt$。逐列扫描：先对从该列开始的矩形做区间 $+1$（`increase` 累加懒标记、`pushdown` 下传），把覆盖格子数累加进答案，再对该列结束的矩形做区间 $-1$。

- **正确性**：区间加维护的是每个格子的覆盖次数，列内每个格子的宽度为 1，故覆盖格子数就是该列贡献的面积，逐列累加得到并集面积。时间复杂度为 $O((n+M)\log M)$。

:::details[题解(C++)]

```c++
typedef pair<int, int> PII;
const int N = 2e6 + 7;
const int M = 1e6 + 2;

struct segment {
    int l;
    int r;
    int lazy_inc;
    int Min;
    int cnt;
} tr[N << 2];
void increase(int rt, int v) {
    int l = tr[rt].l, r = tr[rt].r;
    tr[rt].Min += v;
    tr[rt].lazy_inc += v;
}
void pushdown(int rt) {
    if (tr[rt].lazy_inc) {
        increase(rt << 1, tr[rt].lazy_inc);
        increase(rt << 1 | 1, tr[rt].lazy_inc);
        tr[rt].lazy_inc = 0;
    }
}
void pushup(int n) {
    tr[n].Min = min(tr[n << 1].Min, tr[n << 1 | 1].Min);
    tr[n].cnt = 0;
    if (tr[n].Min == tr[n << 1].Min)
        tr[n].cnt += tr[n << 1].cnt;
    if (tr[n].Min == tr[n << 1 | 1].Min)
        tr[n].cnt += tr[n << 1 | 1].cnt;
}
void build(int rt, int l, int r) {
    tr[rt].l = l;
    tr[rt].r = r;
    tr[rt].lazy_inc = 0;
    if (l == r) {
        tr[rt].Min = 0;
        tr[rt].cnt = 1;
        return;
    }
    int mid = (l + r) >> 1;
    build(rt << 1, l, mid);
    build(rt << 1 | 1, mid + 1, r);
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
int get_Min(int rt, int l, int r) {
    if (l > tr[rt].r || tr[rt].l > r)
        return INF;
    if (l <= tr[rt].l && tr[rt].r <= r) {
        return tr[rt].Min;
    }
    int min1 = INF;
    pushdown(rt);
    min1 = min(min1, get_Min(rt << 1, l, r));
    min1 = min(min1, get_Min(rt << 1 | 1, l, r));
    pushup(rt);
    return min1;
}
struct node {
    int x, y, x_, y_;
};
node a[N];
vector<PII> in[N], out[N];
void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cin >> a[i].x >> a[i].y >> a[i].x_ >> a[i].y_;
        a[i].x += M;
        a[i].y += M;
        a[i].x_ += M;
        a[i].y_ += M;
        a[i].x++;
        a[i].y++;
        in[a[i].x].emplace_back(a[i].y, a[i].y_);
        out[a[i].x_].emplace_back(a[i].y, a[i].y_);
    }
    build(1, 1, N - 2);
    ll ans = 0;
    for (int i = 1; i <= N - 1; i++) {
        for (auto j : in[i]) add(1, j.first, j.second, 1);
        if (get_Min(1, 1, N - 2) == 0) {
            ans += N - 2 - tr[1].cnt;
        }
        for (auto j : out[i]) add(1, j.first, j.second, -1);
    }
    cout << ans << '\n';
}
```

:::

### Robot Path


**题目大意**：机器人从原点出发，依次执行 `n` 条指令（方向 `U`/`D`/`L`/`R` 加步数），沿网格行走；一旦某条指令的第一步会踩上已经过的格子，机器人立即停下、之后的指令不再执行。求机器人最终移动的总距离。

**解题思路**：

- **观察**：机器人停下等价于路径在行走过程中首次回到已经过的点，即轴对齐线段序列首次出现自交；「前缀无自交」对前缀长度单调，于是可以二分最长的无自交前缀。

- **做法**：读入时把连续同方向的指令合并为一条线段，遇到与上一条方向相反的指令直接停止读入（走回头路必然立刻踩上已访问的格子）。把折点坐标离散化后，第 `i` 段是轴对齐线段，其 `x` 范围 `[xl[i], xr[i]]`、`y` 范围 `[yd[i], yu[i]]`。`check(k)` 判定前 `k` 段是否无自交：按 `y` 从小到大扫描，水平线段是覆盖 `x` 区间的区间事件，用 `r` 记录同一 `y` 上已覆盖到的最右端点，出现 `r >= v.l` 的重叠即冲突；竖直线段在下端 `yd` 处向树状数组单点 $+1$、在上端 `yu` 处 $-1$，处理水平线段时用区间和得到与它相交的活跃竖直线段数并从预算 `bound` 中扣除，扣成负数即冲突；竖直线段下端入库前若该点已有活跃竖直线段，同样判冲突（`query(v.l) - query(v.l - 1) != 0`）。

- **正确性**：前缀 `k` 段恰有 $k-1$ 个相邻线段的公共端点，每个端点贡献 1 个交点，预算 `bound = k-1` 正为它们预留，因此扣成负数当且仅当存在额外交点；二分定位到首个冲突段的下标 `j = upper - 1`，第 `j` 段的起点就是机器人停下前的位置。

- **边界**：下标 $0..j-1$ 的 `j` 段完整走过，距离逐段累加；第 `j` 段只走到与前面线段的第一个交点处——对每个 $i<j-1$（跳过与之共享端点的上一段）取它与第 `j` 段包围盒的交叠矩形，非空时用交叠矩形的一对对角 $(l,d)$、$(r,u)$ 到当前位置的曼哈顿距离更新 `wj`（两线段正交相交时交叠矩形退化为交点，该距离即首个交点处）。总时间复杂度为 $O(n\log^2 n)$。

:::details[题解(C++)]

```c++
const int N = 100000;

int tt[N + 1], nt;

void update(int i, int x) {
    while (i < nt) {
        tt[i] += x;
        i |= i + 1;
    }
}

int query(int i) {
    int x = 0;
    while (i >= 0) {
        x += tt[i];
        i &= i + 1;
        i--;
    }
    return x;
}

struct V {
    int y, l, r;
} vv[N * 2];

int xl[N], xr[N], yd[N], yu[N];

bool check(int n) {
    int bound = n - 1;
    int n_ = 0;
    for (int i = 0; i < n; i++)
        if (xl[i] != xr[i])
            vv[n_++] = {yd[i], xl[i], xr[i]};
        else {
            vv[n_++] = {yd[i], xl[i], -INF};
            vv[n_++] = {yu[i], xl[i], INF};
        }
    n = n_;
    sort(vv, vv + n,
         [](auto& u, auto& v) { return u.y < v.y || u.y == v.y && u.r < v.r; });
    fill_n(tt, nt, 0);
    int r = -INF;
    for (int i = 0; i < n; i++) {
        auto& v = vv[i];
        if (i > 0 && vv[i - 1].y != vv[i].y)
            r = -INF;
        if (v.r == -INF) {
            if (query(v.l) - query(v.l - 1) != 0)
                return false;
            update(v.l, 1);
        } else if (v.r == INF) {
            update(v.l, -1);
        } else {
            if (r >= v.l)
                return false;
            bound -= query(v.r) - query(v.l - 1);
            if (bound < 0)
                return false;
            r = v.r;
        }
    }
    return true;
}

bool opposite(char a, char b) {
    return a == 'L' && b == 'R' || a == 'R' && b == 'L' ||
           a == 'D' && b == 'U' || a == 'U' && b == 'D';
}

void solve() {
    static long long xx_[N + 1], yy_[N + 1];
    int n;
    scanf("%d", &n);
    long long x_, y_;
    xx_[0] = x_ = 0;
    yy_[0] = y_ = 0;
    char dir_ = ' ';
    int n_ = 1;
    for (int i = 0; i < n; i++) {
        char s[2];
        int z;
        scanf("%s%d", s, &z);
        char dir = s[0];
        if (opposite(dir, dir_))
            break;
        if (dir == 'L')
            x_ -= z;
        else if (dir == 'R')
            x_ += z;
        else if (dir == 'D')
            y_ -= z;
        else
            y_ += z;
        if (dir_ != dir) {
            dir_ = dir;
            n_++;
        }
        xx_[n_ - 1] = x_;
        yy_[n_ - 1] = y_;
    }
    n = n_ - 1;
    static int xx[N + 1], yy[N + 1], ii[N + 1];
    for (int i = 0; i <= n; i++) ii[i] = i;
    sort(ii, ii + n + 1, [](int i, int j) { return xx_[i] < xx_[j]; });
    for (int h = 0, x = 0; h <= n; h++)
        xx[ii[h]] = h == n || xx_[ii[h]] != xx_[ii[h + 1]] ? x++ : x;
    sort(ii, ii + n + 1, [](int i, int j) { return yy_[i] < yy_[j]; });
    for (int h = 0, y = 0; h <= n; h++)
        yy[ii[h]] = h == n || yy_[ii[h]] != yy_[ii[h + 1]] ? y++ : y;
    for (int i = 0; i < n; i++) {
        xl[i] = xx[i];
        xr[i] = xx[i + 1];
        if (xl[i] > xr[i]) {
            swap(xl[i], xr[i]);
        }
        yd[i] = yy[i];
        yu[i] = yy[i + 1];
        if (yd[i] > yu[i]) {
            swap(yd[i], yu[i]);
        }
    }
    nt = n + 1;
    int lower = 0, upper = n;
    while (upper - lower > 1) {
        n_ = (lower + upper) / 2;
        if (!check(n_))
            upper = n_;
        else
            lower = n_;
    }
    int j = upper - 1;
    x_ = xx_[j];
    y_ = yy_[j];
    static long long xl_[N], xr_[N], yd_[N], yu_[N];
    for (int i = 0; i < n; i++) {
        xl_[i] = xx_[i];
        xr_[i] = xx_[i + 1];
        if (xl_[i] > xr_[i]) {
            swap(xl_[i], xr_[i]);
        }
        yd_[i] = yy_[i];
        yu_[i] = yy_[i + 1];
        if (yd_[i] > yu_[i]) {
            swap(yd_[i], yu_[i]);
        }
    }
    long long w = 0, wj = xr_[j] - xl_[j] + yu_[j] - yd_[j];
    for (int i = 0; i < j; i++) {
        w += xr_[i] - xl_[i] + yu_[i] - yd_[i];
        if (i < j - 1) {
            long long l = max(xl_[i], xl_[j]);
            long long r = min(xr_[i], xr_[j]);
            if (l > r)
                continue;
            long long d = max(yd_[i], yd_[j]);
            long long u = min(yu_[i], yu_[j]);
            if (d > u)
                continue;
            wj = min(wj, abs(l - x_) + abs(d - y_));
            wj = min(wj, abs(r - x_) + abs(u - y_));
        }
    }
    w += wj;
    printf("%lld\n", w);
}
```

:::
