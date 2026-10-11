---
title: "CSES 基础算法"
description: "本篇包含：Introductory Problems（24 题）、Sorting and Searching（35 题）、Dynamic Programming（23 题）。共 82 题。"
pubDate: 2026-01-01T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/12.jpg"
---
本篇包含：Introductory Problems（24 题）、Sorting and Searching（35 题）、Dynamic Programming（23 题）。共 82 题。



## Introductory Problems

### Weird Algorithm


**题目大意**：给定一个正整数 `n`（$n \le 10^6$），反复执行以下操作：若 `n` 是偶数，则将它除以 2；若 `n` 是奇数，则将它乘以 3 再加 1。按顺序输出从初始值到 1 的整个变化过程。

**解题思路**：按规则逐步模拟：每轮输出当前 `n`，`n == 1` 时结束，否则 `n` 为偶数则执行 `n = n / 2`、为奇数则执行 `n = 3 * n + 1`。中途出现的项可能超过 32 位整数范围（$n \le 10^6$ 时峰值约 $5.7\times10^{10}$），故用 `ll` 存储。设序列长度为 $T$，时间复杂度为 $O(T)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    cin >> n;
    while (true) {
        cout << n << " ";
        if (n == 1)
            break;
        if (n % 2 == 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
    }
    cout << "\n";
}
```

:::

### Missing Number


**题目大意**：给出 $1$ 到 `n` 中的 $n-1$ 个互不相同的数（$n \le 2 \times 10^5$），找出唯一缺失的数。

**解题思路**：用布尔数组 `seen` 标记出现过的数：读入 `x` 时置 `seen[x] = true`。由于给出的 $n-1$ 个数互不相同，$1$ 到 `n` 中恰有一个值没有出现，最后扫描 $1$ 到 `n` 时唯一未被标记的下标就是缺失的数。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<bool> seen(n + 1);
    for (int i = 1; i <= n - 1; i++) {
        int x;
        cin >> x;
        seen[x] = true;
    }
    for (int i = 1; i <= n; i++) {
        if (!seen[i]) {
            cout << i << "\n";
        }
    }
}
```

:::

### Repetitions


**题目大意**：给定一个只含 `A`、`C`、`G`、`T` 的字符串（长度 $n \le 10^6$），求由同一字符连续组成的最长子串长度。

**解题思路**：从左到右扫描，`cur` 为以当前位置结尾的连续相同字符段长度。若 `s[i]` 与 `s[i - 1]` 不同，先把 `cur` 清零，随后统一 `cur++`，新段长度恰为 1；每轮用 `cur` 更新答案 `res`。时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    int cur = 1;
    int res = 1;
    for (int i = 1; i < n; i++) {
        if (s[i - 1] != s[i])
            cur = 0;
        cur++;
        res = max(res, cur);
    }
    cout << res << "\n";
}
```

:::

### Increasing Array


**题目大意**：给定一个长度为 `n` 的数组（$n \le 2 \times 10^5$，元素 $\le 10^9$）。每次操作可以把任意元素加 1，求使数组变为不下降序列所需的最少操作次数。

**解题思路**：从左到右贪心。若 `x[i] < x[i - 1]`，为满足不下降，`x[i]` 至少需补到 `x[i - 1]`，把差值 `x[i - 1] - x[i]` 累加进答案并令 `x[i] = x[i - 1]`；多补只会浪费操作并抬高后续元素的下界，故恰好补到相等即最优。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<int> x(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> x[i];
    }
    ll res = 0;
    for (int i = 2; i <= n; i++) {
        if (x[i] < x[i - 1]) {
            res += x[i - 1] - x[i];
            x[i] = x[i - 1];
        }
    }
    cout << res << "\n";
}
```

:::

### Permutations


**题目大意**：构造一个 $1$ 到 `n` 的排列（$n \le 10^6$），使任意两个相邻数之差都不等于 1。若无法构造，输出 `NO SOLUTION`。

**解题思路**：$n=2$ 时两数必相邻、$n=3$ 时无论中间放哪个数都与 1 或 3 相差 1，均无解，输出 `NO SOLUTION`；$n=1$ 直接输出 `1`。$n \ge 4$ 时先按升序输出所有偶数、再按升序输出所有奇数：相邻两数同为偶数或同为奇数时差为 2，两段交界处是最大偶数与 1，差也不为 1，构造合法。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    if (n == 1) {
        cout << 1 << '\n';
    } else if (n == 2 || n == 3) {
        cout << "NO SOLUTION" << '\n';
    } else {
        int l = 2;
        int r = 1;
        while (l <= n) {
            cout << l << " ";
            l += 2;
        }
        while (r <= n) {
            cout << r << " ";
            r += 2;
        }
        cout << '\n';
    }
}
```

:::

### Number Spiral


**题目大意**：无限方格中按数字螺旋的规律填入正整数。

每组输入依次给出行坐标 `x` 和列坐标 `y`（$x, y \le 10^9$），求第 `x` 行、第 `y` 列上的数字。

**解题思路**：

- **做法**：格子所在的螺旋层为 $\max(x,y)$——第 `k` 层由满足 $\max(x,y)=k$ 的格子构成，$(k-1)^2+1$ 至 $k^2$ 沿层依次填入，方向随 `k` 的奇偶交替。按 `x` 与 `y` 的大小分两种情况：
  - 若 $x \ge y$，格子在第 `x` 层的下边。`x` 为奇数时，从底边左端 $(x-1)^2+1$ 起向右递增，答案为 $(x-1)^2+y$；`x` 为偶数时，从底边左端 $x^2$ 起向右递减，答案为 $x^2-y+1$。
  - 若 $y > x$，格子在第 `y` 层的右边。`y` 为奇数时，从右边下端 $y^2$ 起向上递减，答案为 $y^2-x+1$；`y` 为偶数时，从右边上端 $(y-1)^2+1$ 起向下递增，答案为 $(y-1)^2+x$。

- **边界**：坐标最大为 $10^9$，平方结果需用 `ll` 存储。每组询问的时间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    ll x, y;
    cin >> x >> y;
    ll ans = 0;
    if (x >= y) {
        ans = (x & 1 ? (x - 1) * (x - 1) + y : x * x - y + 1);
    } else {
        ans = (y & 1 ? y * y - x + 1 : (y - 1) * (y - 1) + x);
    }
    cout << ans << '\n';
}
```

:::

### Two Knights


**题目大意**：对每个 $k = 1, 2, \ldots, n$（$n \le 10^6$），统计在 $k\times k$ 棋盘上放置两匹马且它们互不攻击的方案数。两匹马不区分先后。

**解题思路**：

- **做法**：总数减去攻击数。任取两个不同格子有 $\binom{k^2}{2}$ 种选法（两匹马不区分先后）。两马互相攻击当且仅当它们占据某个 $2\times3$ 或 $3\times2$ 矩形的一对对角（相距一个马步）；两种朝向的矩形各有 $(k-1)(k-2)$ 个，每个矩形含 2 对攻击角，故攻击方案数为 $2\cdot2(k-1)(k-2)=4(k-1)(k-2)$，所以答案为 $\frac{k^2(k^2-1)}{2}-4(k-1)(k-2)$，代码对 $k\le5$ 预存答案，$k\ge6$ 时把 $4(k-1)(k-2)$ 展开为 `4 * i * i - 12 * i + 8` 直接计算。每个 `k` 的计算为 $O(1)$，总时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int a[9] = {0, 0, 6, 28, 96, 252, 550, 1056, 1848};
void solve() {
    int n;
    cin >> n;
    for (ll i = 1; i <= n; i++) {
        if (i <= 5) {
            cout << a[i] << '\n';
        } else {
            ll ans = i * i * (i * i - 1) / 2;
            ans = ans - 4 * i * i + 12 * i - 8;
            cout << ans << '\n';
        }
    }
}
```

:::

### Two Sets


**题目大意**：把 $1$ 到 `n` 的所有整数（$n \le 10^6$）分成两个集合，使两个集合的元素和相等。若可行，输出任意一种划分；否则输出 `NO`。

**解题思路**：

- **做法**：总和 $s=\frac{n(n+1)}{2}$ 为奇数时无法平分，输出 `NO`；否则令 `res = s / 2`，用大根堆（`priority_queue`，堆顶为最大元素）按 $n,n-1,\ldots,1$ 的顺序取数：若当前数 `x <= res`，放入集合 `a` 并 `res -= x`；否则放入集合 `b`。`res` 减到 0 后剩余的数全部归入 `b`。

- **正确性**：构造必能把 `res` 减到 0。归纳地，设当前剩余目标为 `r`，未处理的数恰为 $1,2,\ldots,x$，维持不变量 $r\le\frac{x(x+1)}{2}$。初始 $r=\frac{s}{2}$ 而未处理数之和为 $s$，成立。若 $r\ge x$，取走 `x` 后 $r-x\le\frac{x(x-1)}{2}$，不变量保持；若 $r<x$，则 $r\le x-1\le\frac{x(x-1)}{2}$（$x=1$ 时必有 $r=0$），不变量同样保持。归纳到底，未处理数取空时 `r = 0`，集合 `a` 的和恰为 $\frac{s}{2}$，其补集 `b` 同为 $\frac{s}{2}$。时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    cin >> n;
    vector<ll> a, b;
    priority_queue<ll> pq;
    for (int i = 1; i <= n; i++) {
        pq.push(i);
    }
    ll res = (n * (n + 1)) / 2;
    if (res & 1) {
        cout << "NO" << '\n';
    } else {
        res /= 2;
        while (res > 0) {
            ll x = pq.top();
            pq.pop();
            if (res >= x) {
                res -= x;
                a.push_back(x);
            } else {
                b.push_back(x);
            }
        }
        while (!pq.empty()) {
            b.push_back(pq.top());
            pq.pop();
        }
        cout << "YES" << '\n';
        cout << a.size() << '\n';
        for (auto x : a) {
            cout << x << " ";
        }
        cout << '\n';
        cout << b.size() << '\n';
        for (auto x : b) {
            cout << x << " ";
        }
        cout << '\n';
    }
}
```

:::

### Bit Strings


**题目大意**：求长度为 `n` 的二进制字符串共有多少个（$n \le 10^6$），答案对 $10^9+7$ 取模。

**解题思路**：每位独立取 0 或 1，共 $2^n$ 种。用快速幂计算——将指数 `n` 按二进制位拆分，通过反复平方底数、在指数为 1 的位上乘入答案，仅需 $O(\log n)$ 次乘法。代码中 `b` 为当前底数（初值 2）、`a` 为答案：`n & 1` 时 `a = a * b % mod`，随后 `b = b * b % mod` 并右移 `n`。时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int mod = 1e9 + 7;
ll expow(ll a, ll b) {          // 乘法结果可达 1e18，必须用 long long
    ll res = 1;
    while (b) {
        if (b & 1)
            res = (res * a) % mod;
        a = (a * a) % mod;
        b >>= 1;
    }
    return res;
}
void solve() {
    int n;
    cin >> n;
    ll a = 1, b = 2;
    while (n) {
        if (n & 1)
            a = (a * b) % mod;
        b = (b * b) % mod;
        n >>= 1;
    }
    cout << a << '\n';
}
```

:::

### Trailing Zeros


**题目大意**：求 $n!$ 的十进制表示末尾有多少个连续的 0（$n \le 10^9$）。

**解题思路**：末尾 0 来自因子 $10=2\times5$，而 $n!$ 中因子 2 多于因子 5，故只需统计因子 5 的个数：$5$ 的倍数各贡献 1 个，$25$ 的倍数多贡献 1 个，依此类推，答案为

$$
\left\lfloor\frac n5\right\rfloor+\left\lfloor\frac n{25}\right\rfloor+\left\lfloor\frac n{125}\right\rfloor+\cdots.
$$

代码循环累加 `n / 5` 并令 `n /= 5`，直到 `n < 5`。时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    cin >> n;
    ll ans = 0;
    while (n >= 5) {
        ans += n / 5;
        n /= 5;
    }
    cout << ans << '\n';
}
```

:::

### Coin Piles


**题目大意**：有 `t` 组询问，每组给两堆硬币数量 `a`、`b`（$a, b \le 10^9$）。每次操作必须从一堆取走 1 枚、从另一堆取走 2 枚。判断能否经过若干次操作将两堆同时取空。

**解题思路**：设取法一（第一堆取 1 枚、第二堆取 2 枚）执行 `x` 次、取法二执行 `y` 次，则

$$
\begin{aligned}
a&=x+2y,\\
b&=2x+y.
\end{aligned}
$$

两式相加得 $a+b=3(x+y)$，故 $a+b$ 必须被 3 整除；解出 $x=\frac{2b-a}{3}$、$y=\frac{2a-b}{3}$，非负要求 $a\le 2b$ 且 $b\le 2a$。代码先交换使 $a\le b$，只需检查 $(a+b)\bmod 3=0$ 且 $b\le 2a$。每组时间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int a, b;
    cin >> a >> b;
    if (a > b)
        swap(a, b);
    if ((a + b) % 3 == 0 && b <= 2 * a)
        cout << "YES" << '\n';
    else
        cout << "NO" << '\n';
}
```

:::

### Palindrome Reorder


**题目大意**：重新排列给定字符串（长度 $n \le 10^6$）的全部字符，使结果成为回文串。若可行，输出任意一种结果；否则输出 `NO SOLUTION`。

**解题思路**：统计各字符出现次数。回文串中除中心外每个字符都成对出现，故出现奇数次的字符至多一个，否则输出 `NO SOLUTION`。构造时按字典序输出每个字符出现次数的一半作为左半，奇数次的字符放中心，再逆序输出另一半作为右半；左右互为镜像，结果必为回文。时间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;

    map<char, int> count;
    for (auto c : s) {
        count[c]++;
    }

    int odds = 0;
    char center;
    for (char c = 'A'; c <= 'Z'; c++) {
        if (count[c] % 2 == 1) {
            odds++;
            center = c;
        }
    }

    if (odds > 1) {
        cout << "NO SOLUTION\n";
    } else {
        for (char c = 'A'; c <= 'Z'; c++) {
            cout << string(count[c] / 2, c);
        }
        if (odds) {
            cout << center;
        }
        for (char c = 'Z'; c >= 'A'; c--) {
            cout << string(count[c] / 2, c);
        }
        cout << "\n";
    }
}
```

:::

### Gray Code


**题目大意**：构造 `n` 位格雷码（$n \le 16$），即按某种顺序输出全部 $2^n$ 个 `n` 位二进制串，使任意相邻两个串恰好有一位不同。

**解题思路**：递归构造。已知 $n-1$ 位格雷码后，先按原顺序给每个串加前缀 `0`，再将其反转后加前缀 `1`：两部分内部相邻仍差一位，交界处两串的后 $n-1$ 位相同、仅最高位不同，同样合法。共生成 $2^n$ 个长度为 `n` 的串，时间复杂度为 $O(n2^n)$。

:::details[题解(C++)]

```c++
vector<string> create(int n) {
    if (n == 1) {
        return {"0", "1"};
    }
    vector<string> code;
    auto prev = create(n - 1);
    for (auto s : prev) {
        code.push_back("0" + s);
    }
    reverse(prev.begin(), prev.end());
    for (auto s : prev) {
        code.push_back("1" + s);
    }
    return code;
}

void solve() {
    int n;
    cin >> n;
    auto code = create(n);
    for (auto s : code) {
        cout << s << "\n";
    }
}
```

:::

### Tower of Hanoi


**题目大意**：有 3 根柱子，需要把 `n` 个大小不同的圆盘（$n \le 16$）从 1 号柱全部移动到 3 号柱，可以借助 2 号柱。每次只能移动一个圆盘，且大圆盘不能放在小圆盘上。输出最少移动次数及每一步操作。

**解题思路**：递归函数 `move(n, a, b, c)` 表示借助柱 `c` 把 `n` 个圆盘从柱 `a` 移到柱 `b`：先把上方 $n-1$ 个从 `a` 移到 `c`，再把最大盘从 `a` 移到 `b`，最后把 $n-1$ 个从 `c` 移到 `b`。三部分互不重叠，且最大盘在第二步单独移动，故步数满足 $T(n)=2T(n-1)+1$、$T(1)=1$，解得 $T(n)=2^n-1$。代码在基准情形 `n == 1` 时把这次移动记入全局数组 `moves`，最后统一输出。时间复杂度为 $O(2^n)$，空间复杂度为 $O(2^n)$。

:::details[题解(C++)]

```c++
vector<pair<int, int>> moves;

void move(int n, int a, int b, int c) {
    if (n == 1) {
        moves.emplace_back(a, b);
    } else {
        move(n - 1, a, c, b);
        move(1, a, b, c);
        move(n - 1, c, b, a);
    }
}

void solve() {
    int n;
    cin >> n;
    move(n, 1, 3, 2);
    cout << moves.size() << "\n";
    for (auto [a, b] : moves) {
        cout << a << " " << b << "\n";
    }
}
```

:::

### Creating Strings


**题目大意**：给定一个由小写字母组成的字符串（长度 $n \le 8$），输出用它的全部字符能够组成的所有不同字符串。结果按字典序排列，并先输出结果数量。

**解题思路**：先把 `s` 排序得到字典序最小的排列，再用 `next_permutation` 依次生成下一个字典序更大的排列直至不存在。该函数对含重复字符的序列会直接跳到下一个不同的排列，不会输出重复串。代码把排列存入 `v`，输出数量后逐行打印。设不同排列数为 $P$，时间复杂度为 $O(Pn)$，$n\le8$ 时可行。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;

    sort(s.begin(), s.end());
    vector<string> v;
    do {
        v.push_back(s);
    } while (next_permutation(s.begin(), s.end()));

    cout << v.size() << "\n";
    for (auto s : v) {
        cout << s << "\n";
    }
}
```

:::

### Apple Division


**题目大意**：有 `n` 个苹果（$n \le 20$），第 `i` 个苹果的重量为 `a[i]`（$\le 10^9$）。把所有苹果分成两组，求两组总重量之差的最小值。

**解题思路**：$n\le20$，枚举全部 $2^n$ 个分组方案。状态 `i` 的第 `j` 位为 1 表示苹果 `a[j]` 分入第一组；该组重量为 `res`，另一组为 `sum - res`，两组差为 $|sum-2res|$，对所有状态取最小值。时间复杂度为 $O(n2^n)$，$n=20$ 时约 $2\times10^7$ 次加法，可通过。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (int i = 0; i <= n - 1; i++) cin >> a[i];
    ll sum = accumulate(a.begin(), a.end(), 0ll);
    ll ans = LONG_LONG_MAX;
    for (int i = 0; i < (1 << n); i++) {
        ll res = 0;
        for (int j = 0; j < n; j++) {
            if (i & (1 << j)) {
                res += a[j];
            }
        }
        ans = min(ans, abs(sum - 2 * res));
    }
    cout << ans << '\n';
}
```

:::

### Chessboard and Queens


**题目大意**：在 $8\times8$ 棋盘上放置 8 个皇后，使任意两个皇后都不在同一行、同一列或同一条对角线上。标记为 `*` 的格子不能放置皇后，求合法方案数。

**解题思路**：逐行回溯，每行恰放一个皇后。递归到第 `y` 行时枚举列 `x`：跳过禁用格，并用 `col[x]` 判列、`diag1[x+y]` 与 `diag2[y-x+N]` 判两条对角线——同一主对角线上格子满足 $x+y$ 相等，同一副对角线上格子满足 $x-y$ 相等（加 `N` 平移为正下标）。无冲突则标记并递归下一行，返回后撤销；到 `y == N` 时 8 行均放置成功，答案加 1，每种合法方案恰被统计一次。搜索树至多 $\sum_{k=0}^{8}\frac{8!}{(8-k)!}\approx10^5$ 个节点，时间复杂度为 $O(8!)$。

:::details[题解(C++)]

```c++
const int N = 8;

string grid[N];
int total;
bool col[N], diag1[2 * N], diag2[2 * N];

void search(int y) {
    if (y == N) {
        total++;
        return;
    }
    for (int x = 0; x < N; x++) {
        if (grid[y][x] == '*') {
            continue;
        }
        if (col[x] || diag1[x + y] || diag2[y - x + N]) {
            continue;
        }
        col[x] = diag1[x + y] = diag2[y - x + N] = true;
        search(y + 1);
        col[x] = diag1[x + y] = diag2[y - x + N] = false;
    }
}

void solve() {
    for (auto& row : grid) {
        cin >> row;
    }
    search(0);
    cout << total << "\n";
}
```

:::

### Raab Game I


**题目大意**：两名玩家各有一套点数为 $1$ 到 `n` 的牌。每轮双方各出一张未使用的牌，点数较大者得 1 分，相同则都不得分。给定最终得分 `a`、`b`，判断结果是否可能；若可能，构造双方的出牌顺序。例：`n = 5, a = 2, b = 1` 时，第一名按 `1 2 4 5 3` 出牌即可（前两轮平局、中间两轮胜、最后一轮负）。

**解题思路**：每轮至多产生 1 分，$a+b>n$ 时直接输出 `NO`。否则令第二名玩家按 $1,2,\ldots,n$ 出牌，为第一名玩家分三段构造排列 `v`：前 $n-a-b$ 轮出 `i`（与对方同点，平局）；随后 `a` 轮出 $i+b$（大于对方点 `i`，胜）；最后 `b` 轮出 $i-a$（小于对方点 `i`，负）。三段取值恰好是 $1$ 到 `n` 的一个排列，故 `v` 合法。最后逐轮比较 `v[i]` 与 `i` 模拟得分，若与给定的 `a`、`b` 吻合则输出方案，否则输出 `NO`。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, a, b;
    cin >> n >> a >> b;
    if (a + b <= n) {
        vector<int> v(n + 1);
        int z = 0;
        for (int i = 1; i <= n - a - b; i++) v[++z] = i;
        for (int i = 1; i <= a; i++) v[++z] = n - a + i;
        for (int i = 1; i <= b; i++) v[++z] = n - a - b + i;
        for (int i = 1; i <= n; i++) {
            if (v[i] > i)
                a--;
            else if (v[i] < i)
                b--;
        }
        if (a || b) {
            cout << "NO" << '\n';
            return;
        }
        cout << "YES" << '\n';
        for (int i = 1; i <= n; i++) cout << v[i] << " ";
        cout << '\n';
        for (int i = 1; i <= n; i++) cout << i << " ";
        cout << '\n';
    } else {
        cout << "NO" << '\n';
    }
}
```

:::

### Mex Grid Construction


**题目大意**：构造一个 $n\times n$ 的网格。每个格子的值等于其左侧同一行与上方同一列中没有出现过的最小非负整数，即这些已有数的 mex。例：$n=3$ 时输出为 `0 1 2 / 1 0 3 / 2 3 0`。

**解题思路**：

- **做法**：按行从左到右填表。格子 `(i, j)` 的值是左侧同行与上方同列已填格中的 mex——最小未出现的非负整数。代码把 `a[i][j]` 初始化为 `-1`，处理 `(i, j)` 时收集当前行前 `j` 个与当前列前 `i` 个数：`a[i][j]` 尚未填写，以 `-1` 被收集两次，其余元素恰为题目要求的集合。排序后从 `p = 0` 扫描，遇 `item == p` 则 `p++`，循环结束 `p` 即 mex；`-1` 不在非负整数范围内，不影响结果。每格收集 $O(n)$ 个数并排序，总时间复杂度为 $O(n^3\log n)$。

:::details[题解(C++)]

```c++
int n;
int a[101][101];
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            a[i][j] = -1;
        }
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i][j] == -1) {
                vector<int> v;
                for (int l = 1; l <= j; l++) {
                    v.emplace_back(a[i][l]);
                }
                for (int r = 1; r <= i; r++) {
                    v.emplace_back(a[r][j]);
                }
                sort(v.begin(), v.end());
                int p = 0;
                for (auto item : v) {
                    if (item == p) {
                        p++;
                    }
                }
                a[i][j] = p;
                cout << a[i][j] << " ";
            }
        }
        cout << '\n';
    }
}
```

:::

### Knight Moves Grid


**题目大意**：在 $n\times n$ 棋盘上，一匹马从左上角出发并按国际象棋中马的规则移动。求到达每个格子的最少步数。

**解题思路**：把格子视为节点、马步视为权值 1 的边，从左上角 BFS 求单源最短路。`grid[y][x]` 同时记录距离与访问状态（`-1` 为未访问）；首次扩展到 `(ny, nx)` 时置 `grid[ny][nx] = grid[y][x] + 1` 并入队（用 `vector` 作队列、下标 `i` 后移）。每个格子至多入队一次，每次检查 8 个方向，时间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<vector<int>> grid(n, vector<int>(n, -1));
    vector<pair<int, int>> queue;

    grid[0][0] = 0;
    queue.emplace_back(0, 0);

    int dy[8] = {1, 1, -1, -1, 2, 2, -2, -2};
    int dx[8] = {2, -2, 2, -2, 1, -1, 1, -1};

    for (int i = 0; i < queue.size(); i++) {
        auto [y, x] = queue[i];
        for (int d = 0; d < 8; d++) {
            int ny = y + dy[d];
            int nx = x + dx[d];
            if (ny < 0 || ny >= n || nx < 0 || nx >= n || grid[ny][nx] != -1) {
                continue;
            }
            grid[ny][nx] = grid[y][x] + 1;
            queue.emplace_back(ny, nx);
        }
    }

    for (int y = 0; y < n; y++) {
        for (int x = 0; x < n; x++) {
            cout << grid[y][x] << " ";
        }
        cout << "\n";
    }
}
```

:::

### Grid Coloring I


**题目大意**：给定一个 $n\times m$ 网格，每个格子的原颜色是 `A` 到 `D` 之一。需要重新为每个格子选择一种颜色，使它与原颜色不同，并且任意上下左右相邻格子的颜色不同。输出一种方案；若不存在则输出 `IMPOSSIBLE`。

**解题思路**：按行、列顺序贪心填色。处理 `(y, x)` 时上方与左侧已确定，候选颜色只需避开原色、上方色、左侧色，至多排除 3 种；`A` 到 `D` 四种颜色中必剩至少一种，取按字母顺序的第一个。之后填右侧与下方格子时同样避开当前色，最终所有相邻格颜色均不同，方案恒存在。时间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;

    vector<string> grid(n);
    for (int i = 0; i < n; i++) {
        cin >> grid[i];
    }

    for (int y = 0; y < n; y++) {
        for (int x = 0; x < m; x++) {
            for (int c = 'A'; c <= 'D'; c++) {
                bool fail = false;
                if (grid[y][x] == c)
                    fail = true;
                if (y > 0 && grid[y - 1][x] == c)
                    fail = true;
                if (x > 0 && grid[y][x - 1] == c)
                    fail = true;
                if (!fail) {
                    grid[y][x] = c;
                    break;
                }
            }
            cout << grid[y][x];
        }
        cout << "\n";
    }
}
```

:::

### Digit Queries


**题目大意**：将所有正整数依次拼接成无限字符串 `123456789101112...`。每次询问给定一个从 1 开始的位置 `n`（$n \le 10^{18}$），求该位置上的数字。

**解题思路**：按位数分块定位。`k` 位数共有 `w` 个（初始 `k = 1`、`w = 9`、`v = 0`），贡献 $w\cdot k$ 个字符；当 `n` 大于当前块长度时整块跳过：`v += w`（`v` 为已跳过的整数个数）、`n -= w * k`，并令 `w *= 10`、`k++`。落在 `k` 位数块内后，`a = (n + k - 1) / k` 是目标字符位于块内第几个整数，故整数为 `z = v + a`；`b = (n - 1 + k) % k` 是字符在 `z` 内的从 0 开始下标，把 `z` 转成字符串后输出 `res[b]`。全程使用 `ll`，每组时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
ll n;
void solve() {
    cin >> n;
    ll w = 9, k = 1, v = 0;
    while (n > w * k) {
        v += w;
        n -= w * k;
        w *= 10;
        k++;
    }
    ll a = (n + k - 1) / k, b = (n - 1 + k) % k;
    ll z = v + a;
    string res = to_string(z);
    cout << res[b] << '\n';
}
```

:::

### String Reorder


**题目大意**：重新排列给定字符串的全部字符，使任意两个相邻字符都不同，并在所有合法排列中字典序最小。若无法做到，输出 `-1`。

**解题思路**：从左到右逐位构造。剩余长度为 `length`、字符 `c` 还剩 `v[c]` 个时，把这些相同字符彼此隔开至少需要 $v[c]-1$ 个其它字符，故必须满足 $2v[c]-1\le length$；`check(length)` 检查所有字符的该条件，初始不满足则输出 `-1`。对每一位按 `A` 到 `Z` 尝试：跳过剩余数为 0 或等于上一位的字符；将候选字符计数减 1 后调用 `check(剩余长度)`，可行则选定并输出该字符，否则恢复计数并尝试下一个。每一位都取剩余多重集仍可行的最小字符，故所得排列在所有合法排列中字典序最小。设字符串长度为 $n$，每位至多尝试 26 个字符、每次校验 26 个字符，总时间复杂度为 $O(26^2n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    string s;
    cin >> s;
    int sz = s.size();
    vector<int> v(26, 0);
    for (auto ch : s) v[ch - 'A']++;
    auto check = [&](int length) {
        for (int i = 0; i <= 25; i++) {
            if (v[i] * 2 - 1 > length) {
                return false;
            }
        }
        return true;
    };
    if (!check(sz)) {
        cout << -1 << '\n';
        return;
    }
    char last = '$';
    for (int i = 0; i <= sz - 1; i++) {
        for (int j = 0; j <= 25; j++) {
            char now = char(j + 'A');
            if (!v[j])
                continue;
            if (now == last)
                continue;
            v[j]--;
            if (check(sz - i - 1)) {
                last = now;
                cout << now;
                break;
            }
            v[j]++;
        }
    }
    cout << '\n';
}
```

:::

### Grid Path Description


**题目大意**：在 $7\times7$ 网格中，从左上角出发，经过恰好 48 步到达左下角，并且不能重复经过格子。输入一个长度为 48 的路径描述串，其中 `D`、`U`、`R`、`L` 表示固定方向，`?` 可表示任意方向。求符合描述的合法路径数。

**解题思路**：直接 DFS 的搜索量最坏为 $4^{48}$，需要剪枝。`dfs(sx, sy, id)` 维护当前位置与已走步数，棋盘四周预置为已访问以统一处理越界；固定字符只沿规定方向走，`?` 则尝试四个方向。共三条剪枝：

1. 到达终点 `(7, 1)` 但 `id < 48` 时返回——路径必须恰好走满 48 步。

2. 上、下方向均不可走而左、右可行（或对称情形）时返回——此时未访问格被当前路径切成互不相通的两块，每块都含未走格子，无法全部走完。图示中 `1` 为当前位置，`0` 为未走格，`#` 为已走或不可走格：

   ```
   000#
   ##1#
   000#
   ```

3. 若路径制造了一个不是终点的死胡同，则被它封闭的方格将无法再访问，因此搜索中要避免产生死胡同。例如当前位置上方的方格三面被挡住（包括当前位置），则下一步必须往上走，否则立刻形成死胡同

   用图来解释：如果两个 `?` 中至少有一个是 `#`，加上我们当前的位置，如果不往上走就会形成死胡同，其他方向同理

   ```
   0#0      0#0      0#0      0#0
   ?0?----->#00----->#10----->##1
   010      1#1      0#0      0#0
   ```

剪枝后实际访问的搜索树节点数 $T$ 远小于 $4^{48}$，总时间复杂度为 $O(T)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
int ans = 0;
string t;
bool mp[9][9];
int dx[4] = {1, -1, 0, 0};
int dy[4] = {0, 0, 1, -1};
char ds[4] = {'D', 'U', 'R', 'L'};
void dfs(int sx, int sy, int id) {
    if (sx < 1 || sx > 7 || sy < 1 || sy > 7 || mp[sx][sy])
        return;
    if (sx == 7 && sy == 1 && id < 48)
        return;
    if (mp[sx - 1][sy] && mp[sx + 1][sy] && !mp[sx][sy + 1] && !mp[sx][sy - 1])
        return;
    if (!mp[sx - 1][sy] && !mp[sx + 1][sy] && mp[sx][sy + 1] && mp[sx][sy - 1])
        return;
    if (id == 48) {
        ans++;
        return;
    }
    mp[sx][sy] = true;
    for (int i = 0; i < 4; i++)
        if (t[id] == ds[i])
            dfs(sx + dx[i], sy + dy[i], id + 1);
    if (t[id] == '?') {
        if (sx > 2 && mp[sx - 2][sy] && !mp[sx - 1][sy] &&
            (mp[sx - 1][sy - 1] || mp[sx - 1][sy + 1]))
            dfs(sx - 1, sy, id + 1);
        else if (sx < 6 && mp[sx + 2][sy] && !mp[sx + 1][sy] &&
                 (mp[sx + 1][sy - 1] || mp[sx + 1][sy + 1]))
            dfs(sx + 1, sy, id + 1);
        else if (sy > 2 && mp[sx][sy - 2] && !mp[sx][sy - 1] &&
                 (mp[sx - 1][sy - 1] || mp[sx + 1][sy - 1]))
            dfs(sx, sy - 1, id + 1);
        else if (sy < 6 && mp[sx][sy + 2] && !mp[sx][sy + 1] &&
                 (mp[sx - 1][sy + 1] || mp[sx + 1][sy + 1]))
            dfs(sx, sy + 1, id + 1);
        else
            for (int i = 0; i < 4; i++) dfs(sx + dx[i], sy + dy[i], id + 1);
    }
    mp[sx][sy] = false;
}
void solve() {
    cin >> t;
    memset(mp, false, sizeof(mp));
    for (int i = 0; i < 9; i++)
        mp[i][0] = mp[i][8] = mp[0][i] = mp[8][i] = true;
    dfs(1, 1, 0);
    cout << ans << '\n';
}
```

:::

## Sorting and Searching

### Distinct Numbers


**题目大意**：给定 `n` 个整数（$n \le 2 \times 10^5$），统计其中有多少个不同的数值。

**解题思路**：把每个数插入 `set` `s`；`set` 中同一个数值只保留一份，故全部插入后 `s.size()` 就是不同数值的个数。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int n;
set<int> s;
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        s.insert(x);
    }
    cout << s.size() << '\n';
}
```

:::

### Apartments


**题目大意**：有 `n` 位申请者和 `m` 套公寓（$n, m \le 2 \times 10^5$）。第 `i` 位申请者期望的面积为 `wishes[i]`，能够接受的实际面积范围是 $[\text{wishes}[i]-k,\ \text{wishes}[i]+k]$。每套公寓至多分给一人，求最多可以满足多少位申请者。

**解题思路**：

- **观察**：一套公寓能否分给某位申请者，只取决于面积是否落在其接受区间 $[\text{wishes}[i]-k,\ \text{wishes}[i]+k]$ 内，与处理的先后无关。于是把 `wishes` 与 `sizes` 分别升序排序后按顺序匹配，不必回头调整已经做出的决定。

- **做法**：`i` 依次遍历排序后的申请者，`j` 指向最小的未处理公寓。先跳过所有满足 `sizes[j] < wishes[i] - k` 的公寓——之后每位申请者的下界都不更小，这些公寓对全体剩余申请者都过小，可以永久丢弃；再看 `sizes[j] <= wishes[i] + k` 是否成立：成立就把 `sizes[j]` 分给 `wishes[i]`（`count` 与 `j` 同时后移），否则公寓已升序排列，当前最小的公寓对 `wishes[i]` 就已过大，跳过该申请者。

- **正确性**：设 `sizes[j]` 是剩余公寓中最小的，且对剩余申请者中期望最小的 `wishes[i]` 可用（其余申请者的期望都不小于 `wishes[i]`）。取一个最大匹配，若其中 `sizes[j]` 分给了 `wishes[i'']`、而 `wishes[i]` 用了更大的 `sizes[j']`（或未配对），则交换两者的公寓：`wishes[i]` 用 `sizes[j]` 可行，`wishes[i'']` 用 `sizes[j']` 也仍可行，因为 `sizes[j'] >= sizes[j] >= wishes[i''] - k` 且 `sizes[j'] <= wishes[i] + k <= wishes[i''] + k`。故贪心这一步不会使最优值下降。时间复杂度为 $O(n\log n + m\log m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m, k;
    cin >> n >> m >> k;

    vector<int> wishes(n);
    for (int i = 0; i < n; i++) {
        cin >> wishes[i];
    }
    sort(wishes.begin(), wishes.end());

    vector<int> sizes(m);
    for (int i = 0; i < m; i++) {
        cin >> sizes[i];
    }
    sort(sizes.begin(), sizes.end());

    int count = 0;
    int j = 0;
    for (int i = 0; i < n; i++) {
        while (j < m && sizes[j] < wishes[i] - k) {
            j++;
        }
        if (j < m && sizes[j] <= wishes[i] + k) {
            count++;
            j++;
        }
    }
    cout << count << "\n";
}
```

:::

### Ferris Wheel


**题目大意**：有 `n` 个孩子（$n \le 2 \times 10^5$），第 `i` 个孩子的体重为 `a[i]`。每个座舱最多坐两人，且两人的体重之和不能超过 `x`，求最少需要多少个座舱。

**解题思路**：

- **做法**：把 `a[1..n]` 升序排序，双指针 `i` 指向最轻者、`j` 指向最重者。每轮分配一个座舱：`a[i] + a[j] <= x` 时二人同坐，`i`、`j` 同时内移；否则 `a[j]` 单独乘坐，只内移 `j`；循环到 `i > j` 为止。

- **正确性**：`a[j]` 是当前最重者，必然占用一个座舱。若 `a[i] + a[j] > x`，则连最轻者都无法与 `a[j]` 同坐，`a[j]` 只能单独乘坐。若 `a[i] + a[j] <= x`，任取一个最优方案：若其中 `a[j]` 独坐而 `a[i]` 与 `a[i'']` 同坐，则改为 `a[j]` 与 `a[i]` 同坐、`a[i'']` 独坐，座舱数不变；若其中 `a[j]` 与 `a[i']` 同坐、`a[i]` 与 `a[i'']` 同坐，则改为 `a[j]` 与 `a[i]` 同坐、`a[i']` 与 `a[i'']` 同坐，后者可行是因为 $a[i']+a[i''] \le a[j]+a[i'] \le x$（$i''$ 与 $i'$ 都不比最重者重）。故总能调整出与贪心相同的配对，座舱数不会更多。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
int n, x, ans;
int a[N];
void solve() {
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i];
    sort(a + 1, a + 1 + n);
    int i = 1, j = n;
    ans = 0;
    while (i <= j) {
        if (a[j] + a[i] > x) {
            j--;
            ans++;
        } else {
            j--;
            i++;
            ans++;
        }
    }
    cout << ans << '\n';
}
```

:::

### Concert Tickets


**题目大意**：有 `n` 张价格已知的门票和 `m` 位依次到来的顾客（$n, m \le 2 \times 10^5$）。每位顾客给出最高愿付价格 `x`，需要卖给他一张价格不超过 `x` 且尽可能贵的票；若不存在这样的票则输出 `-1`。

**解题思路**：用 `multiset` `prices` 保存所有尚未售出的票价，同一价格可重复存放。对每次询问 `x`，`prices.upper_bound(x)` 指向第一个严格大于 `x` 的票价：若它不等于 `prices.begin()`，其前驱就是不超过 `x` 的最大票价，输出该价格并用 `prices.erase(it)` 删除这一张；若它正是 `prices.begin()`，说明所有票价都大于 `x`，输出 `-1`。每次查询与删除均为 $O(\log n)$，总时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;

    multiset<int> prices;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        prices.insert(x);
    }

    for (int i = 1; i <= m; i++) {
        int x;
        cin >> x;
        auto it = prices.upper_bound(x);
        if (it == prices.begin()) {
            cout << "-1\n";
        } else {
            it--;
            cout << *it << "\n";
            prices.erase(it);
        }
    }
}
```

:::

### Restaurant Customers


**题目大意**：给出 `n` 位顾客（$n \le 2 \times 10^5$）各自的到店时间 `a` 和离店时间 `b`，求餐厅中同时存在的顾客人数的最大值。

**解题思路**：把每位顾客拆成到店事件 `(a, 1)` 与离店事件 `(b, -1)`，按时间升序扫描，`count` 为当前店内人数，`high` 记录其最大值。时间相同时 `-1 < 1` 使离店事件排在到店事件之前，故同日「先离开、后到达」的两位顾客不会被算成同时在场。共 $2n$ 个事件，每次事件的处理为 $O(1)$，排序为 $O(n\log n)$，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<pair<int, int>> events;
    for (int i = 1; i <= n; i++) {
        int a, b;
        cin >> a >> b;
        events.emplace_back(a, 1);
        events.emplace_back(b, -1);
    }
    sort(events.begin(), events.end());

    int count = 0;
    int high = 0;
    for (auto [t, d] : events) {
        count += d;
        high = max(high, count);
    }
    cout << high << "\n";
}
```

:::

### Movie Festival


**题目大意**：有 `n` 部电影（$n \le 2 \times 10^5$），每部电影给出开始时间和结束时间。一个人同一时刻只能观看一部电影，求他最多能完整观看多少部电影。

**解题思路**：按结束时间从早到晚贪心。代码把每部电影存成 `(b, a)`（结束时间在前），默认排序即按结束时间升序；`end` 为上一部已选电影的结束时间，当前电影的开始时间满足 `a >= end` 时选择它并令 `end = b`。交换论证：若某个最优解在这一步选的是另一部结束时间更晚的电影，把它替换成当前电影后，已选电影的结束时间不增大，后续可供选择的电影集合只增不减，故选择结束最早的可看电影不会损失最优性。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<pair<int, int>> movies;
    for (int i = 1; i <= n; i++) {
        int a, b;
        cin >> a >> b;
        movies.emplace_back(b, a);
    }
    sort(movies.begin(), movies.end());

    int count = 0;
    int end = 0;
    for (auto [b, a] : movies) {
        if (a >= end) {
            end = b;
            count++;
        }
    }
    cout << count << "\n";
}
```

:::

### Sum of Two Values


**题目大意**：给定长度为 `n` 的数组和目标值 `x`（$n \le 2 \times 10^5$，$x \le 10^9$），寻找两个不同位置，使这两个位置上的数之和等于 `x`。输出任意一组下标；不存在时输出 `IMPOSSIBLE`。

**解题思路**：从左到右扫描，`map` `m` 记录每个已出现数值的下标。读到 `a` 时若 `m[x - a]` 非零，说明补数 $x-a$ 在更早的位置出现过，此时 `m[x - a]` 与 `i` 是两个不同的下标，直接输出；否则令 `m[a] = i` 并继续。用 `map` 实现，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, x;
    cin >> n >> x;
    map<int, int> m;
    for (int i = 1; i <= n; i++) {
        int a;
        cin >> a;
        if (m[x - a]) {
            cout << m[x - a] << " " << i << "\n";
            return;
        }
        m[a] = i;
    }
    cout << "IMPOSSIBLE\n";
}
```

:::

### Maximum Subarray Sum


**题目大意**：给定一个整数数组（$n \le 2 \times 10^5$，$|x| \le 10^9$），求所有非空连续子数组的最大元素和。

**解题思路**：`sum` 维护以当前元素结尾的最大子数组和：读入 `x` 后取 `sum = max(sum + x, x)`，含义是「接上以前一元素结尾的最优子数组」或「从 `x` 处重新开始」，两者取优；随后用 `sum` 更新全局最优 `best`。`sum` 与 `best` 的初值取 $-10^9$，保证全负数组时答案就是其中最大的负数本身，而不会把空子数组（和为 0）误当成答案。时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    ll sum = -1e9;
    ll best = -1e9;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        sum = max(sum + x, x);
        best = max(best, sum);
    }
    cout << best << "\n";
}
```

:::

### Stick Lengths


**题目大意**：有 `n` 根长度已知的木棍（$n \le 2 \times 10^5$，长度 $\le 10^9$）。把一根木棍改成另一整数长度的代价等于长度差的绝对值，求使所有木棍长度相同的最小总代价。

**解题思路**：设目标长度为 $t$，总代价为 $f(t)=\sum_i|a[i]-t|$。$t$ 每增加 1，代价的变化量等于（小于 $t$ 的元素个数）−（大于 $t$ 的元素个数）；该量关于 $t$ 单调不减，并恰在越过中位数时由负变正，故 $f$ 在中位数处取最小值。代码排序后令 `b = a[n / 2]`（`n` 为偶数时中间两个数之间的任一整数都等价），再累加每个 $|a[i]-b|$。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int n;
vector<ll> a;
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        a.emplace_back(x);
    }
    sort(a.begin(), a.end());
    ll ans = 0, b = a[n / 2];
    for (int i = 0; i <= n - 1; i++) {
        ans += abs(a[i] - b);
    }
    cout << ans << '\n';
}
```

:::

### Missing Coin Sum


**题目大意**：给定 `n` 枚面值为正整数的硬币（$n \le 2 \times 10^5$，面值 $\le 10^9$），每枚硬币至多使用一次，求无法由某个硬币子集凑出的最小正整数金额。

**解题思路**：

- **观察**：把 `values` 升序排序后依次考虑硬币，用 `largest` 记录「已处理的硬币能够凑出 $[1,\text{largest}]$ 内所有金额」这一性质——`largest` 同时就是已处理硬币能连续凑出的上界。

- **做法**：若下一枚 `values[i] <= largest + 1`，则把它并进已有方案，可凑出的金额扩展为 $[1,\text{largest}+\text{values}[i]]$；否则 `largest + 1` 无法凑出，它就是答案。代码在循环中累加 `largest += values[i]`，跳出后输出 `largest + 1`，对「所有硬币都能并入」的情形同样成立。

- **正确性**：`values[i] > largest + 1` 时，已处理的硬币只能凑出不超过 `largest` 的金额，而更靠后的硬币面值都不小于 `values[i]`，也无法凑出 `largest + 1`，故答案确为 `largest + 1`。`values[i] <= largest + 1` 时，$[1,\text{largest}]$ 中每个金额加上 `values[i]` 得到 $[\text{values}[i]+1,\ \text{largest}+\text{values}[i]]$，该区间与 $[1,\text{largest}]$ 相接或重叠，并集恰为 $[1,\text{largest}+\text{values}[i]]$，归纳可知 `largest` 始终是最大可连续凑出的上界。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<int> values(n);
    for (int i = 0; i < n; i++) {
        cin >> values[i];
    }
    sort(values.begin(), values.end());

    ll largest = 0;
    for (int i = 0; i < n; i++) {
        if (values[i] > largest + 1) {
            break;
        }
        largest += values[i];
    }
    cout << largest + 1 << "\n";
}
```

:::

### Collecting Numbers


**题目大意**：数组是 `1` 到 `n` 的一个排列（$n \le 2 \times 10^5$）。每一轮只能从左到右扫描，并按 $1, 2, \ldots, n$ 的顺序收集数字，求收集完所有数字至少需要多少轮。

**解题思路**：记 `pos[x]` 为值 `x` 在排列中的位置。同一轮中只能按位置递增的顺序取数，故若 `pos[i] < pos[i - 1]`，收集到 `i - 1` 时 `i` 已经被越过，必须另开一轮；反之 `i` 可以在同一轮中紧随 `i - 1` 收集。于是最少轮数等于 $1$ 加上满足 `pos[i] < pos[i - 1]` 的下标 `i`（$i = 2..n$）的个数。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<int> pos(n + 1);
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        pos[x] = i;
    }

    int rounds = 1;
    for (int i = 2; i <= n; i++) {
        if (pos[i] < pos[i - 1])
            rounds++;
    }
    cout << rounds << "\n";
}
```

:::

### Collecting Numbers II


**题目大意**：给定 `1` 到 `n` 的一个排列（$n \le 2 \times 10^5$），以及 `m` 次交换操作（$m \le 2 \times 10^5$）。每次交换位置 `u`、`v` 上的数后，输出按顺序收集 $1,2,\ldots,n$ 所需的最少轮数。

**解题思路**：

- **观察**：轮数只取决于相邻值对 $(i-1,i)$ 的位置关系——`id[i] < id[i - 1]` 的值对使轮数加 1。交换位置 `u`、`v` 上的数 `x = a[u]`、`y = a[v]` 后，只有 $(x-1,x)$、$(x,x+1)$、$(y-1,y)$、$(y,y+1)$ 这至多四个值对的位置关系会改变，`res` 只需在这几处做增减。

- **做法**：以 `x` 从 `u` 移到 `v` 为例（`id[x] = u`）：若原来 `id[x - 1] < id[x]` 而 `id[x - 1] >= v`，即 `x - 1` 原本在后、移动后落到 `x` 之前，值对 $(x-1,x)$ 由升序变逆序，`res++`；若原来 `id[x - 1] > id[x]` 而 `id[x - 1] <= v`，则它由逆序变回升序，`res--`。对 $(x,x+1)$ 用同样的两条判定。写回 `id[x] = v` 后，对 `y` 从 `v` 移到 `u` 重复这四组判定，最后写回数组 `a[u] = y`、`a[v] = x`。哨兵 `id[0] = 0`、`id[n + 1] = n + 1` 使 $i = 1$ 与 $i = n$ 处的值对无需特判。

- **正确性**：未被移动的值对两端位置都没变，对轮数的贡献不变；被移动的值对只有上述四种，其顺序变化由「另一端位置落在新位置之前还是之后」精确判定，故每次交换后 `res` 就是当前排列的轮数。预处理时间复杂度为 $O(n)$，每次交换的时间复杂度为 $O(1)$，总时间复杂度为 $O(n+m)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
int n, m;
int ans[N], id[N], a[N];
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        id[a[i]] = i;
    }
    id[0] = 0;
    id[n + 1] = n + 1;
    int res = 1;
    for (int i = 2; i <= n; i++) {
        if (id[i] < id[i - 1])
            res++;
    }
    int x, y, u, v;
    for (int i = 1; i <= m; i++) {
        cin >> u >> v;
        x = a[u], y = a[v];
        if (id[x - 1] < id[x] && id[x - 1] >= v)
            res++;
        if (id[x - 1] > id[x] && id[x - 1] <= v)
            res--;
        if (id[x] < id[x + 1] && v >= id[x + 1])
            res++;
        if (id[x] > id[x + 1] && v <= id[x + 1])
            res--;
        id[x] = v;
        if (id[y - 1] < id[y] && id[y - 1] >= u)
            res++;
        if (id[y - 1] > id[y] && id[y - 1] <= u)
            res--;
        if (id[y] < id[y + 1] && u >= id[y + 1])
            res++;
        if (id[y] > id[y + 1] && u <= id[y + 1])
            res--;
        id[y] = u;
        a[u] = y;
        a[v] = x;
        cout << res << '\n';
    }
}
```

:::

### Playlist


**题目大意**：给定按播放顺序排列的 `n` 首歌（$n \le 2 \times 10^5$），每首歌有一个编号。求编号互不相同的最长连续片段长度。

**解题思路**：滑动窗口，窗口写成左开右闭的 `(left, i]`。`last[x]` 记录编号 `x` 上一次出现的位置，读到 `x` 时先令 `left = max(left, last[x])`：若 `x` 上次出现在窗口内，左端就收缩到该位置，从而保证新窗口中 `x` 只出现一次；此时窗口长度 `i - left` 就是「以 `i` 结尾的最长无重复片段」，用它更新 `best`，再置 `last[x] = i`。`left` 与 `i` 都只向右移动。用 `map` 实现，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    map<int, int> last;
    int left = 0;
    int best = 0;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        left = max(left, last[x]);
        best = max(best, i - left);
        last[x] = i;
    }
    cout << best << "\n";
}
```

:::

### Towers


**题目大意**：依次处理 `n` 个方块（$n \le 2 \times 10^5$）。一个方块可以放到某座塔顶，但必须严格小于当前塔顶；也可以新建一座塔。求放完所有方块所需的最少塔数。

**解题思路**：用 `multiset` `towers` 保存所有塔当前的塔顶高度。对方块 `x`，`towers.upper_bound(x)` 给出严格大于 `x` 的最小塔顶：存在则把该塔顶替换为 `x`（`towers.erase(it)` 后插入 `x`），否则所有塔顶都不大于 `x`，只能新建一座塔。把 `x` 放到满足条件的最小塔顶上，等价于把更大的塔顶保留给后续方块，可容纳的方块集合不会变小，故塔数最少。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    multiset<int> towers;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        auto it = towers.upper_bound(x);
        if (it == towers.end()) {
            towers.insert(x);
        } else {
            towers.erase(it);
            towers.insert(x);
        }
    }
    cout << towers.size() << "\n";
}
```

:::

### Traffic Lights


**题目大意**：一条道路覆盖位置 `0` 到 `n`（$n \le 10^9$），依次在 `m` 个位置安装红绿灯（$m \le 2 \times 10^5$）。每安装一盏灯后，输出相邻红绿灯之间的最大距离。

**解题思路**：用 `set` `s` 保存所有灯的位置（初始为 `{0, n}`），用 `multiset` `t` 保存相邻灯之间的间距（初始为 `{n}`）。插入位置 `x` 时，`s.lower_bound(x)` 给出其右侧的灯 `q`，`q` 的前驱 `p` 是左侧的灯；记 `b = *p`、`a = *q`，把间距 `a - b` 从 `t` 中删除，再插入 `a - x` 与 `x - b`，此时 `*t.rbegin()` 就是当前的最大间距。每次操作的时间复杂度为 $O(\log m)$，总时间复杂度为 $O(m\log m)$，空间复杂度为 $O(m)$。

:::details[题解(C++)]

```c++
int n, m;
multiset<int> s, t;
void solve() {
    cin >> n >> m;
    t.insert(n);
    s.insert(0);
    s.insert(n);
    while (m--) {
        int x;
        cin >> x;
        auto p = s.lower_bound(x);
        auto q = p--;
        int b = *p;
        int a = *q;
        s.insert(x);
        t.erase(t.lower_bound(a - b));
        t.insert(a - x);
        t.insert(x - b);
        cout << (*t.rbegin()) << ' ';
    }
}
```

:::

### Distinct Values Subarrays


**题目大意**：给定长度为 `n` 的数组（$n \le 2 \times 10^5$），统计元素两两不同的连续子数组数量。

**解题思路**：滑动窗口计数。`last_pos[x]` 记录值 `x` 上一次出现的位置，`left_pos` 是「以 `i` 结尾的无重复窗口」的最左位置：读到 `x` 后令 `left_pos = max(left_pos, last_pos[x] + 1)`，此时窗口 `[left_pos, i]` 内每个值都只出现一次。以 `i` 结尾的合法子数组，其左端点可取 `left_pos` 到 `i` 中的任意一个，共 `i - left_pos + 1` 个，累加进 `count`，再置 `last_pos[x] = i`。每个合法子数组恰在其右端点处被计入一次。用 `map` 实现，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    map<int, int> last_pos;
    int left_pos = 1;
    ll count = 0;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        left_pos = max(left_pos, last_pos[x] + 1);
        count += i - left_pos + 1;
        last_pos[x] = i;
    }

    cout << count << "\n";
}
```

:::

### Distinct Values Subsequences


**题目大意**：给定一个数组（$n \le 2 \times 10^5$），统计有多少个非空子序列满足其中的数值互不相同，答案对 $10^9+7$ 取模。相同数值选自不同位置时会形成不同的选择。

**解题思路**：按数值独立计数。若某个值在数组中出现 `count` 次，则对它共有 `count + 1` 种选择（不选它，或选它某个出现位置），且这些选择与其它数值的选择互不影响；由乘法原理，全部合法选择（含空子序列）的数量就是所有数值的 `count + 1` 之积，减去空子序列即为答案，过程中对 `M` 取模。用 `map` `counts` 统计每个值的出现次数，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int M = 1e9 + 7;
void solve() {
    int n;
    cin >> n;

    map<int, int> counts;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        counts[x]++;
    }

    ll answer = 1;
    for (auto [value, count] : counts) {
        answer *= (count + 1);
        answer %= M;
    }
    answer = (answer - 1 + M) % M;
    cout << answer << "\n";
}
```

:::

### Josephus Problem I


**题目大意**：`n` 个编号为 `1` 到 `n` 的孩子（$n \le 2 \times 10^5$）围成一圈，从 `1` 号开始，每隔一个孩子移除下一个，输出完整的移除顺序。

**解题思路**：用 `vector` `v` 模拟这个圈：下标 `i` 从左到右扫描，`i` 为偶数时当前孩子被保留并 `push_back` 到 `v` 末尾，`i` 为奇数时把他输出（即移除）。被追加的孩子排在队尾，等前面的元素处理完后按同样规则继续处理，因而等价于首尾相接、隔一个移除一个。每个孩子恰好被输出一次，而每次扫描保留的人数约为上一批的一半，故追加的总次数不超过 $n$，循环在 `i` 追上 `v.size()` 时结束。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<int> v;
    for (int i = 1; i <= n; i++) {
        v.push_back(i);
    }

    for (int i = 0; i < v.size(); i++) {
        if (i % 2 == 0) {
            v.push_back(v[i]);
        } else {
            cout << v[i] << " ";
        }
    }
    cout << "\n";
}
```

:::

### Josephus Problem II


**题目大意**：`n` 个编号为 `1` 到 `n` 的孩子（$n \le 2 \times 10^5$）围成一圈。每次跳过 `k` 个仍在圈中的孩子，再移除下一个，输出完整的移除顺序（含最后剩下的一个）。

**解题思路**：

- **做法**：用支持顺序统计的平衡树（PBDS 的 `__gnu_pbds::tree`）`s` 保存仍在圈中的编号，`find_by_order(i)` 返回其中第 `i` 小的编号（下标从 0 计），查询与删除都是 $O(\log n)$。从 `1` 号起数、跳过 `k` 个再移除下一个，对应初始下标 `i = k % n`；每移除一个编号，它后面的编号在树中的下标都前移 1，下一次的移除位置因此变为 `i + k` 对当前人数取模，代码写作 `i += k; i %= n;`（此时 `n` 已减 1）。循环到只剩一个编号时结束，把 `*s.rbegin()` 输出。

- **正确性**：设当前在树中的移除下标为 `i`，删除后原下标 `i + 1` 的元素落到下标 `i`，所以「从被删位置的下一位继续数」等价于在删后的树上从下标 `i` 起继续。跳过 `k` 个编号即跨过下标 `i, i+1, \ldots, i+k-1`，要移除的下标为 `i + k`，环上取模当前人数后仍在合法下标范围内，故每一步的定位都是精确的。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
                         __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    oset;
int n, k;
oset s;
void solve() {
    cin >> n >> k;
    for (int i = 1; i <= n; i++) s.insert(i);
    int i = k % n;
    while (s.size() != 1) {
        cout << (*s.find_by_order(i)) << ' ';
        s.erase(s.find_by_order(i));
        n--;
        i += k;
        i %= n;
    }
    cout << (*s.rbegin()) << '\n';
}
```

:::

### Nested Ranges Check


**题目大意**：给定 `n` 个区间（$n \le 2 \times 10^5$）。对每个区间分别判断：它是否包含至少一个其他区间，以及它是否被至少一个其他区间包含。第一行输出“包含其他区间”的结果，第二行输出“被其他区间包含”的结果。

**解题思路**：

- **观察**：区间 $A=[l_A,r_A]$ 包含 $B=[l_B,r_B]$ 当且仅当 $l_A\le l_B$ 且 $r_A\ge r_B$。把「包含」拆成左端点关系与右端点条件两部分：用排序固定前者，用有序集合统计后者。本题只需判断存在性，数出个数后取「是否大于 0」即可。

- **做法**：第一遍按 `l` 降序、同 `l` 时按 `r` 升序排序并扫描，用有序集合 `s` 维护已处理区间的右端点：集合中区间的左端点都不小于当前区间的 `l`，其中满足右端点 $\le$ 当前 `r` 的正好被当前区间包含，其个数为 `order_of_key(r + 1)`，大于 0 就在第一行输出 1。第二遍按 `l` 升序、同 `l` 时按 `r` 降序排序并扫描，此时集合中区间的左端点都不大于当前 `l`，包含当前区间的区间还须满足右端点 $\ge$ 当前 `r`，个数为 `s.size() - order_of_key(r)`，大于 0 就在第二行输出 1。两遍的排序方向保证了同左端点的一对区间中，只有右端点更大者把更小者计入。

- **正确性**：`order_of_key(x)` 返回集合中严格小于 `x` 的元素个数，配合两遍排序分别穷尽了「左端点在当前区间之前」与「左端点在当前区间之后」的候选，而右端点条件恰是包含关系所需的另一半，故每个区间的两项结果都是判定性的。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
typedef __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
                         __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    oset;
struct w {
    int l, r;
    int id;
};
w a[N];
int n;
oset s;
bool hasInner[N], isInner[N];            // 它包含别的区间 / 它被别的区间包含
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i].l >> a[i].r, a[i].id = i;

    sort(a + 1, a + 1 + n, [](const w& A, const w& B) {   // l 降序、同 l 时 r 升序
        if (A.l == B.l)
            return A.r < B.r;
        return A.l > B.l;
    });
    for (int i = 1; i <= n; i++) {
        hasInner[a[i].id] = s.order_of_key(a[i].r + 1) > 0;   // 集合里 r <= 当前 r 的区间就被它包含
        s.insert(a[i].r);
    }

    s.clear();
    sort(a + 1, a + 1 + n, [](const w& A, const w& B) {   // l 升序、同 l 时 r 降序
        if (A.l == B.l)
            return A.r > B.r;
        return A.l < B.l;
    });
    for (int i = 1; i <= n; i++) {
        isInner[a[i].id] = (int)s.size() - s.order_of_key(a[i].r) > 0;   // 还需 r >= 当前 r 才包含它
        s.insert(a[i].r);
    }

    for (int i = 1; i <= n; i++) cout << (hasInner[i] ? 1 : 0) << " \n"[i == n];
    for (int i = 1; i <= n; i++) cout << (isInner[i] ? 1 : 0) << " \n"[i == n];
}
```

:::

### Nested Ranges Count


**题目大意**：给定 `n` 个区间 `[l, r]`（$n \le 2 \times 10^5$）。对每个区间分别统计它包含多少个其他区间，以及它被多少个其他区间包含，并按输入顺序输出两组答案。

**解题思路**：

- **观察**：区间 $A$ 包含 $B$ 当且仅当 $l_A\le l_B$ 且 $r_A\ge r_B$。把「包含」拆成左端点关系与右端点条件两部分：排序固定前者，PBDS 顺序统计树对后者计数。

- **做法**（统计它包含多少个）：按 `l` 降序、同 `l` 时按 `r` 升序排序，用顺序统计树 `s` 维护已处理区间的右端点。处理 `a[i]` 时集合中区间的左端点都不小于 `a[i].l`（同 `l` 者右端点更小），故其中满足 $r\le a[i].r$ 的区间恰被 `a[i]` 包含，个数为 `order_of_key(a[i].r + 1)`，累加进 `ans[a[i].id].first`，再把 `a[i].r` 插入 `s`。

- **做法**（统计它被多少个包含）：按 `l` 升序、同 `l` 时按 `r` 降序排序，集合中区间的左端点都不大于 `a[i].l`（同 `l` 者右端点更大）。包含 `a[i]` 的区间还需满足 $r\ge a[i].r$，个数为 `s.size() - order_of_key(a[i].r)`，累加进 `ans[a[i].id].second`，同样插入 `a[i].r`。

- **正确性**：两遍扫描的排序方向保证了同左端点的一对区间中，只有左端点更靠前的那一个参与比较，不会重复计数；`order_of_key` 统计的正是满足另一侧端点条件的区间数，故两组计数都不重不漏。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
typedef __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
                         __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    oset;
struct w {
    int l, r;
    int id;
};
w a[N];
int n;
oset s;
pair<int, int> ans[N];
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i].l >> a[i].r, a[i].id = i;
    sort(a + 1, a + 1 + n, [](const w& A, const w& B) {
        if (A.l == B.l)
            return A.r < B.r;
        return A.l > B.l;
    });
    for (int i = 1; i <= n; i++) {
        if (s.empty())
            s.insert(a[i].r);
        else {
            int id = s.order_of_key(a[i].r + 1);
            ans[a[i].id].first += id;
            s.insert(a[i].r);
        }
    }
    sort(a + 1, a + 1 + n, [](const w& A, const w& B) {
        if (A.l == B.l)
            return A.r > B.r;
        return A.l < B.l;
    });
    s.clear();
    for (int i = 1; i <= n; i++) {
        if (s.empty())
            s.insert(a[i].r);
        else {
            int id = s.size() - s.order_of_key(a[i].r);
            ans[a[i].id].second += id;
            s.insert(a[i].r);
        }
    }
    for (int i = 1; i <= n; i++) cout << ans[i].first << " ";
    cout << '\n';
    for (int i = 1; i <= n; i++) cout << ans[i].second << " ";
}
```

:::

### Room Allocation


**题目大意**：有 `n` 位顾客（$n \le 2 \times 10^5$），第 `i` 位顾客从到达日 `a[i].in` 到离开日 `a[i].out` 占用一个房间。若前一位顾客在某日离开，同一房间只能分给在更晚日期到达的顾客。求最少房间数，并按输入顺序输出每位顾客的房间编号。

**解题思路**：

- **做法**：按到达日 `a[i].in` 升序处理顾客。小根堆 `q` 中存 `(离开日, 房间号)`，`operator<` 反向比较使离开日最小者位于堆顶，即当前最早空出的房间。若 `a[i].in > q.top().time`，就复用堆顶房间：令 `a[i].ans = q.top().id`，弹出后压入 `(a[i].out, a[i].ans)`；否则新开一间（`cnt` 加 1）并压入。处理完后按 `a[i].id` 重排回输入顺序，输出 `cnt` 与各人的 `a[i].ans`。

- **正确性**：堆顶是已占用房间中最早空出的一个。若顾客 `i` 连它都来不及使用，其余房间的空出时间只会更晚，也都无法复用，只能新开房间；反之复用最早空出的房间，可让其余房间保留更早的空出时间，不会使所需房间数增加。

- **边界**：判定使用严格大于 `a[i].in > q.top().time`，即离开日与到达日相同的两位顾客仍视为占用重叠，不能共用同一房间。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
struct w {
    int time, id;
    bool operator<(const w& a) const { return time > a.time; }
};
struct node {
    int in, out, id, ans;
};
int n;
const int N = 2e5 + 7;
priority_queue<w> q;
node a[N];
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i].in >> a[i].out, a[i].id = i;
    sort(a + 1, a + 1 + n,
         [](const node& A, const node& B) { return A.in < B.in; });
    int cnt = 1;
    q.push({a[1].out, cnt});
    a[1].ans = 1;
    for (int i = 2; i <= n; i++) {
        if (a[i].in > q.top().time) {
            a[i].ans = q.top().id;
            q.pop();
            q.push({a[i].out, a[i].ans});
        } else {
            cnt++;
            a[i].ans = cnt;
            q.push({a[i].out, a[i].ans});
        }
    }
    sort(a + 1, a + 1 + n,
         [](const node& A, const node& B) { return A.id < B.id; });
    cout << cnt << '\n';
    for (int i = 1; i <= n; i++) cout << a[i].ans << ' ';
}
```

:::

### Factory Machines


**题目大意**：有 `n` 台并行工作的机器（$n \le 2 \times 10^5$），第 `i` 台机器生产一件产品需要 `a[i]` 个时间单位。求生产至少 `m` 件产品（$m \le 10^9$）所需的最短时间。

**解题思路**：二分答案。给定时间 `x`，第 `i` 台机器可生产 $\lfloor x/a[i]\rfloor$ 件，判定函数 `f(x)` 累加总产量并在达到 `m` 时立即返回可行，避免后续累加溢出；总产量关于 `x` 单调不减，故可二分最小的可行时间，区间取 $[0,10^{18}]$。总时间复杂度为 $O(n\log 10^{18})$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
ll n, m, a[N];
bool f(ll x) {
    ll res = 0;
    for (int i = 1; i <= n; i++) {
        res += x / a[i];
        if (res >= m)
            return 1;
    }
    return 0;
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    ll l = 0, r = 1e18;
    while (l < r) {
        ll mid = (l + r) / 2;
        if (f(mid))
            r = mid;
        else
            l = mid + 1;
    }
    cout << l << '\n';
}
```

:::

### Tasks and Deadlines


**题目大意**：有 `n` 个任务（$n \le 2 \times 10^5$），第 `i` 个任务耗时为 `a[i].first`，截止时间为 `a[i].second`。任务必须逐个完成，其收益为“截止时间减去完成时刻”，求最大总收益。

**解题思路**：

- **观察**：设第 `i` 个任务的完成时刻为 $f_i$、截止时间为 $d_i$，则总收益为 $\sum_i(d_i-f_i)=\sum_i d_i-\sum_i f_i$。所有截止时间之和与执行顺序无关，故只需最小化完成时刻之和 $\sum_i f_i$。

- **做法**：把任务按耗时 `a[i].first` 升序排序后依次执行，`now` 累计已完成任务的耗时（即当前时刻），`res` 累加每个任务的 `a[i].second - now`。

- **正确性**：相邻交换论证。设某时刻为 $t$，两个相邻任务的耗时为 $x > y$：按「先 $x$ 后 $y$」执行时这两项的完成时刻之和为 $2t+2x+y$，按「先 $y$ 后 $x$」执行时为 $2t+2y+x$，后者比前者小 $x-y>0$，且其余任务的完成时刻不变。故任何相邻逆序对交换后 $\sum_i f_i$ 严格减小，反复交换即得耗时升序的排列，该排列使 $\sum_i f_i$ 最小。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
pair<int, int> a[N];
void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i].first >> a[i].second;
    sort(a + 1, a + 1 + n);
    ll res = 0, now = 0;
    for (int i = 1; i <= n; i++) {
        now += a[i].first;
        res += a[i].second - now;
    }
    cout << res << '\n';
}
```

:::

### Reading Books


**题目大意**：两个人都要读完同样的 `n` 本书（$n \le 2 \times 10^5$），每本书的阅读时间已知；两人可以同时阅读，但不能在同一时刻读同一本书。求两人都读完所有书的最短总时间。

**解题思路**：记总阅读时间为 `total`、单本最长阅读时间为 `longest`。两人合计要读完两遍，故总时间至少为 `total`；`longest` 这一本必须被错开阅读两遍，故总时间又至少为 $2\cdot\text{longest}$。这两个下界都可达到：`total >= 2 * longest` 时，一人先读 `longest`、再读其余书，另一人先读完其余书、等 `longest` 空出后接上，总时间为 `total`；否则一人先读 `longest`、随后读其余书，另一人先读完其余书、再等 `longest` 空出后阅读，总时间为 $2\cdot\text{longest}$。故答案为 `max(total, 2 * longest)`。时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    ll total = 0;
    ll longest = 0;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        total += x;
        longest = max(longest, x);
    }
    cout << max(total, 2 * longest) << "\n";
}
```

:::

### Sum of Three Values


**题目大意**：给定长度为 `n` 的数组和目标值 `x`（$n \le 5000$），寻找三个互不相同的下标，使对应元素之和等于 `x`。输出任意一组答案；不存在时输出 `IMPOSSIBLE`。

**解题思路**：

- **做法**：把元素与原下标组成 `pair` 存入 `v` 并按数值升序排序。枚举 `v[i]` 作为三个数中的最小者，令 `y = x - v[i].first`，在 `v[i + 1 .. n - 1]` 上用双指针 `a`（左）、`b`（右）找和为 `y` 的两个数：`v[a].first + v[b].first > y` 时左移 `b`，小于 `y` 时右移 `a`，相等时输出 `v[i].second`、`v[a].second`、`v[b].second` 三个原下标。

- **正确性**：指针只在「当前元素不可能参与任何和为 `y` 的二元组」时移动。若 `v[a].first + v[b].first > y`，则区间 `[a, b-1]` 中任一 `v[q].first` 都不小于 `v[a].first`，任何以 `b` 为右端的二元组之和都大于 `y`，故 `b` 可以安全左移；若 `v[a].first + v[b].first < y`，同理任何以 `a` 为左端的二元组之和都小于 `y`，`a` 可以安全右移。被移出窗口的下标在此前已被同样排除，故只要窗口内存在和为 `y` 的二元组就一定被找到。

- **边界**：三者的下标满足 `i < a < b`，输出的是排序前记录的原下标，互不相同；枚举完所有 `i` 仍未命中时输出 `IMPOSSIBLE`。时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, x;
    cin >> n >> x;

    vector<pair<int, int>> v;
    for (int i = 1; i <= n; i++) {
        int a;
        cin >> a;
        v.emplace_back(a, i);
    }
    sort(v.begin(), v.end());

    for (int i = 0; i < n; i++) {
        int y = x - v[i].first;
        int a = i + 1;
        int b = n - 1;
        while (a < b) {
            int s = v[a].first + v[b].first;
            if (s == y) {
                cout << v[i].second << " ";
                cout << v[a].second << " ";
                cout << v[b].second << "\n";
                return;
            } else if (s > y) {
                b--;
            } else {
                a++;
            }
        }
    }
    cout << "IMPOSSIBLE\n";
}
```

:::

### Sum of Four Values


**题目大意**：给定长度为 `n` 的数组和目标值 `x`（$n \le 1000$），寻找四个互不相同的下标，使对应元素之和等于 `x`。输出任意一组答案；不存在时输出 `IMPOSSIBLE`。

**解题思路**：

- **做法**：把全部两数组合 `(a[i] + a[j], i, j)`（$i < j$）插入有序集合 `sums`。按 `i` 从小到大枚举作为「第三大下标」的位置：先把所有较小下标为 `i` 的组合从 `sums` 中删除（即删除 `{a[i] + a[j], i, j}`，此时集合中只剩两个下标都大于 `i` 的组合），再让 `j = i - 1, \ldots, 1` 枚举「最大下标」，令 `diff = x - a[i] - a[j]`，用 `sums.lower_bound({diff, 0, 0})` 找到和最小且不小于 `diff` 的组合。

- **正确性**：`sums` 中留存组合的两个下标都大于 `i`，而 `j < i`，故输出的四个下标 `j < i < a < b` 互不相同。组合按 `(和, 下标1, 下标2)` 字典序排列，与给定和相等的组合恰好紧跟在 `(diff, 0, 0)` 之后；`lower_bound` 返回的组合若其和不等于 `diff`，说明不存在和为 `diff` 的组合。枚举所有 `(i, j)` 后仍未命中即无解。总时间复杂度为 $O(n^2\log n)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, x;
    cin >> n >> x;

    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    set<tuple<int, int, int>> sums;
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            sums.emplace(a[i] + a[j], i, j);
        }
    }

    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            sums.erase({a[i] + a[j], i, j});
        }
        for (int j = i - 1; j >= 1; j--) {
            int diff = x - a[i] - a[j];
            auto it = sums.lower_bound({diff, 0, 0});
            if (it == sums.end())
                continue;
            auto [sum, a, b] = *it;
            if (sum != diff)
                continue;
            cout << i << " " << j << " " << a << " " << b << "\n";
            return;
        }
    }
    cout << "IMPOSSIBLE\n";
}
```

:::

### Nearest Smaller Values


**题目大意**：给定数组 `a`（$n \le 2 \times 10^5$）。对每个位置 `i`，寻找左侧距离它最近且满足值严格小于 `a[i]` 的位置；若不存在则输出 `0`。

**解题思路**：用单调栈维护一组「位置递增、值严格递增」的候选下标，栈由 `vector` `stack` 实现，元素为 `(值, 位置)` 对。读到 `x` 时先弹出栈顶所有值 $\ge x$ 的元素：它们不是 `x` 的最近更小值，且由于 `x` 在它们右侧、值也不更大，它们对后续元素同样不再可能是答案。弹出后栈顶（若存在）就是左侧最近的更小值的位置，输出其位置分量，否则输出 `0`；随后把 `(x, i)` 入栈。每个元素至多入栈、出栈一次，时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<pair<int, int>> stack;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        while (!stack.empty() && stack.back().first >= x) {
            stack.pop_back();
        }
        if (!stack.empty()) {
            cout << stack.back().second << " ";
        } else {
            cout << 0 << " ";
        }
        stack.emplace_back(x, i);
    }
    cout << "\n";
}
```

:::

### Subarray Sums I


**题目大意**：给定一个只包含正整数的数组（$n \le 2 \times 10^5$），统计元素和恰好等于 `x` 的连续子数组数量。

**解题思路**：双指针维护当前窗口 `[j, k - 1]` 的和 `sum`，其中 `k` 是下一个待纳入的位置。元素全为正数，故 `sum` 关于 `k` 单调不减、关于 `j` 单调不增：`sum <= x` 时先判断 `sum == x` 并让 `ans` 加 1，再把 `a[k]` 纳入并右移 `k`；`sum > x` 时减去 `a[j]` 并右移 `j`。哨兵 `a[n + 1] = 1e18` 使 `k` 越过 `n` 后 `sum` 必然超过 `x`，窗口持续收缩直到 `j` 越过 `n`、循环结束。两指针都只单向移动，每个和为 `x` 的窗口恰在扩展过程中被检查一次。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
ll n, x;
ll a[N];
void solve() {
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i];
    int j = 1, k = 1;
    a[n + 1] = 1e18;
    ll sum = 0, ans = 0;
    while (j <= n) {
        if (sum <= x) {
            if (sum == x)
                ans++;
            sum += a[k];
            k++;
        } else {
            sum -= a[j];
            j++;
        }
    }
    cout << ans << '\n';
}
```

:::

### Subarray Sums II


**题目大意**：给定一个可能包含负数的数组（$n \le 2 \times 10^5$），统计元素和恰好等于 `x` 的连续子数组数量。

**解题思路**：前缀和计数。子数组 `[l, i]` 的和等于 `x`，等价于前缀和满足 $S[i]-S[l-1]=x$，即 $S[l-1]=S[i]-x$。`map` `m` 记录每个前缀和已出现的次数：扫描时先令 `res += a[i]`，把 `m[res - x]` 计入 `ans`，再令 `m[res]++`。代码额外用 `res == x` 单独统计以位置 1 开头的子数组——与之配对的空前缀和 $S[0]=0$ 未被存入 `m`，这一句等价于预先置 `m[0] = 1`。用 `map` 实现，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
ll n, x;
ll a[N];
map<ll, ll> m;
void solve() {
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i];
    ll res = 0, ans = 0;
    for (int i = 1; i <= n; i++) {
        res += a[i];
        ans += (res == x ? 1 : 0);
        if (m.count(res - x))
            ans += m[res - x];
        m[res]++;
    }
    cout << ans << '\n';
}
```

:::

### Subarray Divisibility


**题目大意**：给定长度为 `n` 的整数数组（$n \le 2 \times 10^5$），统计元素和能够被 `n` 整除的连续子数组数量。

**解题思路**：子数组的和能被 `n` 整除，当且仅当它两端前缀和对 `n` 同余。`sum` 维护当前前缀和对 `n` 的规范余数（写作 `((sum + x) % n + n) % n`，保证落在 $[0, n-1]$ 内），`a[sum]` 统计每个余数出现过的次数。任取两个同余的前缀即可确定一个合法子数组，同一余数的所有前缀两两配对，贡献 $\binom{a[i]}{2}$ 个；此外余数为 0 的前缀还能与空前缀配对，这部分共 `a[0]` 个。故答案为
$$
a[0]+\sum_{i=0}^{n-1}\binom{a[i]}{2}.
$$
时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
ll n;
void solve() {
    cin >> n;
    vector<ll> a(n);
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        sum = ((sum + x) % n + n) % n;
        a[sum]++;
    }
    ll ans = a[0];
    for (int i = 0; i <= n - 1; i++) {
        if (a[i] > 0)
            ans += (a[i] * (a[i] - 1)) / 2ll;
    }
    cout << ans << '\n';
}
```

:::

### Distinct Values Subarrays II


**题目大意**：给定长度为 `n` 的数组（$n, k \le 2 \times 10^5$），统计包含不同数值种类不超过 `k` 的连续子数组数量。

**解题思路**：滑动窗口，`map` `m` 记录窗口 `[beg, i - 1]` 内各值的出现次数，窗口内至多保留 `k` 种值。加入 `a[i]` 前，若 `a[i]` 不在窗口内且窗口已含 `k` 种值，就从左端收缩：逐个递减 `m[a[beg]]` 并右移 `beg`，直到某个值的计数减到 0（`m.erase` 后 `beg++`），窗口空出一个种类为止。随后加入 `a[i]`，窗口 `[beg, i]` 至多含 `k` 种值，以 `i` 结尾的合法子数组共有 `i - beg + 1` 个，全部累加进 `ans`。每个位置至多进入、离开窗口一次，每次 `map` 操作为 $O(\log k)$，总时间复杂度为 $O(n\log k)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
int n, k;
int a[N];
void solve() {
    cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> a[i];
    map<int, int> m;
    int beg = 1;
    ll ans = 0;
    for (int i = 1; i <= n; i++) {
        if (!m.count(a[i]) && m.size() == k) {
            while (beg <= i) {
                m[a[beg]]--;
                if (m[a[beg]] == 0) {
                    m.erase(a[beg]);
                    beg++;
                    break;
                }
                beg++;
            }
        }
        m[a[i]]++;
        ans += (i - beg + 1);
    }
    cout << ans << '\n';
}
```

:::

### Array Division


**题目大意**：把长度为 `n` 的数组（$n \le 2 \times 10^5$，元素 $\le 10^9$）划分成 `k` 个非空连续段，使所有段中最大的元素和尽可能小，输出这个最小值。

**解题思路**：二分最大段和的上限 `x`。判定函数 `f(x)` 用贪心分段：若某个 `a[i] > x` 则该上限不可行；否则从左到右累加 `res`，一旦 `res > x` 就结算一段（`ans++`、`res` 清零），并用 `i--` 让当前元素作为新段的首元素重新处理；扫描结束后 `res` 非零则最后一段也计入。每段都在不超过 `x` 的前提下尽量长，得到的段数就是以 `x` 为上限时的最少段数；段数不超过 `k` 时，继续拆分某一段（元素均为正，拆分不会使任何一段超过 `x`）即可得到恰好 `k` 段的划分，故「最少段数 $\le k$」与「能以 `x` 为上限划分为 `k` 段」等价。段数关于 `x` 单调不增，二分最小的可行 `x` 即可。时间复杂度为 $O(n\log 10^{16})$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
ll n, k;
ll a[N];
bool f(ll x) {
    ll ans = 0, res = 0;
    for (int i = 1; i <= n; i++) {
        if (a[i] > x)
            return false;
        res += a[i];
        if (res > x) {
            res = 0;
            ans++;
            i--;
        }
    }
    if (res)
        ans++;
    if (ans <= k)
        return true;
    return false;
}
void solve() {
    cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> a[i];
    ll l = 0, r = 1e16;
    while (l < r) {
        ll mid = (l + r) / 2;
        if (f(mid))
            r = mid;
        else
            l = mid + 1;
    }
    cout << l << '\n';
}
```

:::

### Movie Festival II


**题目大意**：有 `n` 部电影和 `k` 位观众（$n, k \le 2 \times 10^5$），每部电影给出开始、结束时间。每位观众同一时刻只能看一部电影，求所有观众总共最多能完整观看多少部电影。

**解题思路**：

- **做法**：把电影存为 `(结束时间, 开始时间)` 并升序排序；`multiset` `times` 保存 `k` 位观众各自的空闲时刻，初始全为 0。对每部电影 `(b, a)`，`times.upper_bound(a)` 指向第一个严格大于 `a` 的空闲时刻，其前驱即「空闲时刻不超过 `a` 的观众中空闲最晚者」；若该前驱存在（`it != times.begin()`），就让他观看：`answer` 加 1，删除旧空闲时刻 `it--` 后插入 `b`；否则这部电影无人可看，跳过。

- **正确性**：一是「能看就看」不劣：若某方案把这部电影给了空闲时刻 $t\le a$ 的观众，而空闲时刻 $t_{\max}\le a$ 的观众另有安排，则把两人从这部电影起的任务整体对调——$t_{\max}$ 的所有者可以直接看这部电影，而空闲更早的 $t$ 接手对方此后的每一部也仍然可行（那些电影的开始时间都不早于 $b\ge a\ge t_{\max}$）。二是按结束时间升序处理不劣：把方案中此时观看的另一部电影换成结束更早的当前电影后，观众被占用的区间结束得更早，其余安排不受影响。故贪心解与最优解观影数相同。时间复杂度为 $O(n\log n+n\log k)$，空间复杂度为 $O(n+k)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;

    vector<pair<int, int>> events;
    for (int i = 1; i <= n; i++) {
        int a, b;
        cin >> a >> b;
        events.emplace_back(b, a);
    }
    sort(events.begin(), events.end());

    multiset<int> times;
    for (int i = 1; i <= k; i++) {
        times.insert(0);
    }

    int answer = 0;
    for (auto [b, a] : events) {
        auto it = times.upper_bound(a);
        if (it == times.begin())
            continue;
        answer++;
        it--;
        times.erase(it);
        times.insert(b);
    }

    cout << answer << "\n";
}
```

:::

### Maximum Subarray Sum II


**题目大意**：给定长度为 `n` 的整数数组（$n \le 2 \times 10^5$，$|a[i]| \le 10^9$），求长度在 `[l, r]` 范围内的非空连续子数组的最大元素和。

**解题思路**：

- **观察**：设前缀和 `c[i]`，则以 `i` 为右端点、左端前缀下标为 `j` 的子数组和为 `c[i] - c[j]`，长度落在 `[l, r]` 内等价于 $j\in[i-r,\ i-l]$，故只需该窗口内最小的 `c[j]`。

- **做法**：用 `multiset` `s` 维护窗口内的前缀和。对 `i = l..r`，插入 `c[i - l]` 后集合恰为 $\{c[0..i-l]\}$（此时 $i-r\le 0$，与窗口 $[i-r,\ i-l]$ 一致），用 `c[i] - *s.begin()` 更新答案；对 `i = r+1..n`，先插入新进入窗口的 `c[i - l]`，再删除滑出窗口的 `c[i - r - 1]`（用 `s.lower_bound` 定位，只删一个副本），集合恰为窗口内的全部前缀和，`*s.begin()` 即窗口最小值。

- **正确性**：集合内容与 $j$ 的合法范围一一对应，故 `c[i] - *s.begin()` 是右端点 `i` 处的最优子数组和，取所有 `i` 的最大值即为答案。`ans` 初值取 `LONG_LONG_MIN`，即使数组元素全为负数也能被正确更新。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
int n, l, r;
ll a[N], c[N];
multiset<ll> s;
void solve() {
    cin >> n >> l >> r;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        c[i] = c[i - 1] + a[i];
    }
    ll ans = LONG_LONG_MIN;
    for (int i = l; i <= r; i++) {
        s.insert(c[i - l]);
        ans = max(ans, c[i] - (*s.begin()));
    }
    for (int i = r + 1; i <= n; i++) {
        s.insert(c[i - l]);
        s.erase(s.lower_bound(c[i - r - 1]));
        ans = max(ans, c[i] - (*s.begin()));
    }
    cout << ans << '\n';
}
```

:::

## Dynamic Programming

### Dice Combinations


**题目大意**：每次掷骰子可以得到 1 到 6 中的一个点数，求点数总和恰好为 `n` 的序列数量（$n \le 10^6$），顺序不同视为不同方案，答案对 $10^9+7$ 取模；例如 `n = 2` 时有 $1+1$ 与 $2$ 两种。

**解题思路**：设 `ways[i]` 为点数总和恰为 `i` 的方案数，`ways[0] = 1`（空序列）。按 `i` 从小到大计算，枚举最后一次掷出的点数 `v`（$1 \le v \le 6$，要求 `i >= v`），此前部分需凑出 $i-v$，故 $\text{ways}[i]=\sum_{v=1}^{6}\text{ways}[i-v]$，内层枚举完再对 $10^9+7$ 取模。答案为 `ways[n]`，时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int mod = 1e9 + 7;
void solve() {
    int n;
    cin >> n;

    vector<ll> ways(n + 1);
    ways[0] = 1;
    for (int i = 1; i <= n; ++i) {
        ways[i] = 0;
        for (int v = 1; v <= 6; ++v) {
            if (i - v >= 0)
                ways[i] += ways[i - v];
        }
        ways[i] %= mod;
    }

    cout << ways[n] << "\n";
}
```

:::

### Minimizing Coins


**题目大意**：给定 `n` 种面值不同的硬币（$n \le 100$，面值 $\le 10^6$），每种硬币都可以使用任意次。求凑出总金额 `x`（$x \le 10^6$）至少需要多少枚硬币；若无法凑出，则输出 `-1`。

**解题思路**：设 `f[i]` 为凑出金额 `i` 的最少硬币数，初值 `f[i] = INF`，`f[0] = 0`。按金额 `i` 从 1 到 `x` 递增计算，内层枚举最后一枚硬币 `j`（要求 `i >= a[j]`）：$f[i]=\min(f[i],\,f[i-a[j]]+1)$。因为是从小到大枚举，算 `f[i]` 时所有更小金额的最优值已经确定，同一枚硬币可以被重复使用。若最终 `f[x]` 仍为 `INF` 则输出 `-1`。时间复杂度为 $O(nx)$，空间复杂度为 $O(x)$。

:::details[题解(C++)]

```c++
const int N = 1e6 + 7;                     // x <= 1e6，数组必须开到 x 的上界
int n, x, a[111], f[N];
void solve() {
    memset(f, INF, sizeof(f));
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i];
    f[0] = 0;
    for (int i = 1; i <= x; i++) {
        for (int j = 1; j <= n; j++) {
            if (i >= a[j])
                f[i] = min(f[i], f[i - a[j]] + 1);
        }
    }
    cout << (f[x] == INF ? -1 : f[x]) << '\n';
}
```

:::

### Coin Combinations I


**题目大意**：`n` 种硬币（$n \le 100$，每种可使用无限次），求凑出总额 `x`（$x \le 10^6$）的方案数，硬币出现的顺序不同算不同方案，答案对 $10^9+7$ 取模；例如面值为 $1,2$ 时，`x = 3` 有 $1+1+1$、$1+2$、$2+1$ 三种。

**解题思路**：设 `f[i]` 为凑出金额 `i` 的有序方案数，初值在输入阶段给出：对每枚硬币的下标 `i` 置 `f[a[i]] = 1`（只含这一枚硬币的序列）。按金额 `i` 从小到大计算，内层枚举最后一枚硬币 `j`（要求 `i >= a[j]`），它之前的序列需凑出 $i-a[j]$，故 $f[i]=\sum_{j} f[i-a[j]] \pmod{10^9+7}$。转移按「最后一枚硬币是哪一种」分类，同一组硬币的不同排列或在末枚处不同、或在前缀的顺序上不同，各自恰好被计入一次。答案为 `f[x]`，时间复杂度为 $O(nx)$，空间复杂度为 $O(x)$。

:::details[题解(C++)]

```c++
const int N = 1e6 + 7;                     // x <= 1e6
const int mod = 1e9 + 7;
ll n, x;
ll a[111];
ll f[N];
void solve() {
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i], f[a[i]] = 1;
    for (int i = 1; i <= x; i++) {
        for (int j = 1; j <= n; j++) {
            if (i >= a[j])
                f[i] = (f[i] + f[i - a[j]]) % mod;
        }
    }
    cout << f[x] << '\n';
}
```

:::

### Coin Combinations II


**题目大意**：`n` 种硬币（$n \le 100$，每种可使用无限次），求凑出总额 `x`（$x \le 10^6$）的方案数，只关心每种硬币用了几个，顺序不同不算不同方案，答案对 $10^9+7$ 取模；例如面值为 $1,2$ 时，`x = 3` 只有 $1+1+1$ 与 $1+2$ 两种。

**解题思路**：设 `f[j]` 为凑出金额 `j` 的方案数（顺序不同不算不同方案）。按硬币种类逐种引入，对第 `i` 种硬币让 `j` 从小到大执行 $f[j] += f[j-a_i]$。关键是**内层 `j` 从小到大**：`f[j - a[i]]` 在本轮可能已经被更新过，那正表示「再用一枚第 `i` 种硬币」，所以同一种硬币可以重复使用；而硬币种类在外层，同一组合里的各种硬币只按种类顺序被计入一次，排列不会重复统计。初始 `f[0] = 1`，答案为 `f[x]`。时间复杂度为 $O(nx)$，空间复杂度为 $O(x)$——二维的 `f[i][j]` 可以就地滚成一维，因为第 `i` 层只依赖本层的 `j-a[i]`。

:::details[题解(C++)]

```c++
const int N = 1e6 + 7;                     // x <= 1e6
const int mod = 1e9 + 7;
int n, x;
int a[111];
int f[N];
void solve() {
    cin >> n >> x;
    for (int i = 1; i <= n; i++) cin >> a[i];
    f[0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = a[i]; j <= x; j++)                  // j 递增：同一种硬币可以继续用
            f[j] = (f[j] + f[j - a[i]]) % mod;
    cout << f[x] << '\n';
}
```

:::

### Removing Digits


**题目大意**：给定整数 `n`（$n \le 10^6$），每次可以减去它十进制表示里的任意一个数字，求把 `n` 变成 0 所需的最少步数；例如 `n = 27` 时最少 5 步：$27\to20\to18\to10\to9\to0$。

**解题思路**：设 `steps[i]` 为把 `i` 减到 0 的最少步数，`steps[0] = 0`。按 `i` 从 1 到 `n` 递增计算（$i-d<i$，所以更小的值都已算好），最后一步必减去 `i` 的某个数字 `d`，故 $\text{steps}[i]=1+\min_{d\in\text{digits}(i)}\text{steps}[i-d]$，代码对每个 `i` 用取模与整除逐位取出它的数字。数字 0 对应的候选是 `steps[i] + 1`，不会影响最小值。答案为 `steps[n]`，时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<int> steps(n + 1);
    steps[0] = 0;
    for (int i = 1; i <= n; ++i) {
        steps[i] = 1e9;
        int number = i;
        while (number) {
            int digit = number % 10;
            steps[i] = min(steps[i], steps[i - digit] + 1);
            number /= 10;
        }
    }

    cout << steps[n] << "\n";
}
```

:::

### Grid Paths I


**题目大意**：给定一个 $n\times n$ 网格（$n \le 1000$），部分格子有陷阱而不能经过。每一步只能向右或向下，求从左上角到右下角的路径数，答案对 $10^9+7$ 取模。

**解题思路**：设 `f[i][j]` 为从左上角走到 `(i,j)` 的路径数，`a[i][j]` 是格子的字符。每一步只能向右或向下，故 `(i,j)` 只能来自上方或左方：$f[i][j]=f[i-1][j]+f[i][j-1]\pmod{10^9+7}$，且只在 `a[i][j] == '.'` 时累加，陷阱格保持 0。初值为 `a[1][1] == '.'` 时 `f[1][1] = 1`。按 `i`、`j` 从小到大扫描；第 0 行与第 0 列是全局零值，`a` 在那里也不等于 `'.'`，因此边界不需要特判。答案为 `f[n][n]`，时间复杂度为 $O(n^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const int mod = 1e9 + 7;
int n;
char a[1001][1001];
ll f[1001][1001];
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            cin >> a[i][j];
        }
    }
    if (a[1][1] == '.')
        f[1][1] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i][j] == '.') {
                if (a[i][j - 1] == '.')
                    f[i][j] = (f[i][j] + f[i][j - 1]) % mod;
                if (a[i - 1][j] == '.')
                    f[i][j] = (f[i][j] + f[i - 1][j]) % mod;
            }
        }
    }
    cout << f[n][n] << '\n';
}
```

:::

### Book Shop


**题目大意**：`n` 本书（$n \le 1000$），每本有价格 `h[i]` 和页数 `s[i]`，预算为 `x`（$x \le 10^5$，总花费不超过 `x`），每本最多买一次，求能买到的最大总页数。

**解题思路**：设 `total[j]` 为花费不超过 `j` 时能买到的最大页数，初始全 0。逐本考虑书 `i`，内层容量 `j` **从大到小**遍历（从 `x` 递减到 `h[i]`）：$total[j]=\max(total[j],\,s[i]+total[j-h[i]])$。倒序保证读到的 `total[j-h[i]]` 还是未考虑当前这本书的旧值，每本书因此至多被买一次。答案为 `total[x]`，时间复杂度为 $O(nx)$，空间复杂度为 $O(x)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, x;
    cin >> n >> x;

    vector<int> h(n), s(n);
    for (int i = 0; i < n; ++i) cin >> h[i];
    for (int i = 0; i < n; ++i) cin >> s[i];

    vector<int> total(x + 1);
    for (int i = 0; i < n; ++i) {
        for (int j = x; j >= h[i]; --j) {
            total[j] = max(total[j], s[i] + total[j - h[i]]);
        }
    }

    cout << total[x] << "\n";
}
```

:::

### Array Description


**题目大意**：有一个长度为 `n` 的数组（$n \le 10^5$），每个元素都在 1 到 `m` 之间（$m \le 100$），且相邻元素之差不超过 1。部分位置的值未知，用 0 表示，求满足条件的填法数量，答案对 $10^9+7$ 取模；例如 `a = [2, 0, 2]`、`m = 4` 时中间一位只能取 1、2、3，共 3 种填法。

**解题思路**：设 `dp[i][j]` 为填好前 `i` 位、且第 `i` 位取值为 `j` 的方案数。相邻元素之差不超过 1，故第 `i` 位为 `j` 时前一位只能取 $j-1$、$j$、$j+1$，转移为 $dp[i][j]=dp[i-1][j-1]+dp[i-1][j]+dp[i-1][j+1]$（只接受 $1\le k\le m$ 的 `k`），对 $10^9+7$ 取模。初值：`a[1] == 0` 时对 $0\le j\le m$ 令 `dp[1][j] = 1`，其中 `dp[1][0]` 不在取值范围里、也不会被后续转移读到；`a[1] != 0` 时只令 `dp[1][a[1]] = 1`。按 `i` 从 2 到 `n` 填表：`a[i] == 0` 时对全部 $1\le j\le m$ 枚举更新，否则只更新 `dp[i][a[i]]`。答案为 $\sum_{j=1}^{m}dp[n][j]$，时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
const int mod = 1e9 + 7;
ll n, m;
ll a[N], dp[N][101];
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    if (a[1] == 0) {
        for (int i = 0; i <= m; i++) dp[1][i] = 1;
    } else {
        dp[1][a[1]] = 1;
    }
    for (int i = 2; i <= n; i++) {
        if (a[i] == 0) {
            for (int j = 1; j <= m; j++) {
                for (int k : {j - 1, j, j + 1}) {
                    if (k >= 1 && k <= m)
                        (dp[i][j] += dp[i - 1][k]) %= mod;
                }
            }
        } else {
            for (int k : {a[i] - 1, a[i], a[i] + 1}) {
                if (k >= 1 && k <= m)
                    (dp[i][a[i]] += dp[i - 1][k]) %= mod;
            }
        }
    }
    ll ans = 0;
    for (int i = 1; i <= m; i++) (ans += dp[n][i]) %= mod;
    cout << ans << '\n';
}
```

:::

### Counting Towers


**题目大意**：用宽、高都为整数的方块搭建一座宽为 2、高为 `n` 的塔，问有多少种不同的搭建方式（左右对称的算不同），答案对 $10^9+7$ 取模（多组询问，$n \le 10^6$）；例如 `n = 1` 时可用两块 $1\times1$ 或一块 $2\times1$，共 2 种。

**解题思路**：

- **观察**：块的长宽可取任意整数，塔的结构只取决于顶部两格是否属于同一块。设 `towers[i][1]` 为高 `i` 且顶部两格**分属不同块**（独立）的方案数，`towers[i][0]` 为顶部两格**同属一块**（连通）的方案数，高度 1 时各为 1。

- **做法**：按高度 `i` 从 2 递增到 `N - 1` 填表（`N = 1e6 + 7`，对应题目允许的最大高度）。每向上加一行，枚举新行两格的覆盖方式（新放 $1\times1$、新放横跨两列的 $1\times2$、或把下方块的顶边上扩一格）：
  
  - 独立 $\to$ 独立 4 种：两列各新放 $1\times1$；左扩原右新放；左新放右扩原；两列各上扩一格。
  - 连通 $\to$ 独立 1 种：两列各新放 $1\times1$。
  - 连通 $\to$ 连通 2 种：整个块上扩一格；新放一个 $1\times2$ 横块。
  - 独立 $\to$ 连通 1 种：新放一个 $1\times2$ 横块。
  
  即
  $$
  \begin{aligned}
  \text{towers}[i][1]&=4\cdot\text{towers}[i-1][1]+\text{towers}[i-1][0],\\
  \text{towers}[i][0]=\text{towers}[i-1][1]+2\cdot\text{towers}[i-1][0].
  \end{aligned}
  $$
  
  答案为 `(towers[n][0] + towers[n][1]) % M`，即最后一行的两种状态之和；预处理时间复杂度为 $O(N)$，每组时间复杂度为 $O(1)$，空间复杂度为 $O(N)$。

:::details[题解(C++)]

```c++
const int N = 1e6 + 7;                     // x/高度上界 1e6
const int M = 1e9 + 7;
ll towers[N][2];
void solve() {
    towers[1][1] = 1;
    towers[1][0] = 1;

    for (int i = 2; i < N; ++i) {
        towers[i][1] = (4 * towers[i - 1][1] + towers[i - 1][0]) % M;
        towers[i][0] = (towers[i - 1][1] + 2 * towers[i - 1][0]) % M;
    }

    int t;
    cin >> t;
    for (int ti = 0; ti < t; ++ti) {
        int n;
        cin >> n;
        cout << (towers[n][0] + towers[n][1]) % M << "\n";
    }
}
```

:::

### Edit Distance


**题目大意**：求把字符串 `a` 变成字符串 `b` 的最少操作次数（长度均 $\le 5000$），允许的操作是插入一个字符、删除一个字符、替换一个字符。

**解题思路**：设 `distance[i][j]` 为把 `a` 的前 `i` 个字符变成 `b` 的前 `j` 个字符的最少操作数。边界：`distance[i][0] = i`（把 `a` 的前 `i` 个字符全删掉）、`distance[0][j] = j`（插入 `b` 的前 `j` 个字符）。按 `i`、`j` 从小到大填表，按末字符分三种情况取最小值：删掉 `a[i-1]`，代价 `distance[i-1][j] + 1`；插入 `b[j-1]`，代价 `distance[i][j-1] + 1`；把 `a[i-1]` 改成 `b[j-1]`（两者相同则无需操作），代价 `distance[i-1][j-1] + (a[i-1] != b[j-1])`。答案为 `distance[n][m]`，时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
void solve() {
    string a, b;
    cin >> a >> b;
    int n = a.size(), m = b.size();

    vector<vector<int>> distance(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; ++i) {
        distance[i][0] = i;
    }
    for (int j = 0; j <= m; ++j) {
        distance[0][j] = j;
    }

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            distance[i][j] = min({
                distance[i][j - 1] + 1,
                distance[i - 1][j] + 1,
                distance[i - 1][j - 1] + (a[i - 1] != b[j - 1]),
            });
        }
    }

    cout << distance[n][m] << "\n";
}
```

:::

### Longest Common Subsequence


**题目大意**：给定两个整数数组（长度分别为 `n`、`m`），求它们的最长公共子序列（LCS）的长度，并输出一个具体的 LCS。

**解题思路**：设 `lcs[i][j]` 为 `a` 前 `i` 个元素与 `b` 前 `j` 个元素的 LCS 长度，初值全为 0。按 `i`、`j` 从小到大填表：若 `a[i] == b[j]`，该元素可以接到 `a` 前 `i-1` 个与 `b` 前 `j-1` 个的 LCS 之后，`lcs[i][j] = lcs[i-1][j-1] + 1`；否则两个末元素不可能同时被用上，取 `max(lcs[i-1][j], lcs[i][j-1])`。答案为 `lcs[n][m]`。恢复方案时从 `(n, m)` 回退：`a[n] == b[m]` 则收录 `a[n]` 并让 `n`、`m` 同时减一，否则比较 `lcs[n-1][m]` 与 `lcs[n][m]`，相等就令 `n` 减一、不等就令 `m` 减一；回退到 `lcs[n][m] == 0` 为止，最后把收录的元素反转输出。时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$，恢复方案仅需 $O(n+m)$ 次回退。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;

    vector<int> a(n + 1), b(m + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }
    for (int i = 1; i <= m; i++) {
        cin >> b[i];
    }

    vector<vector<int>> lcs(n + 1, vector<int>(m + 1));

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i] == b[j]) {
                lcs[i][j] = lcs[i - 1][j - 1] + 1;
            } else {
                lcs[i][j] = max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
    }

    cout << lcs[n][m] << "\n";

    vector<int> result;
    while (lcs[n][m] > 0) {
        if (a[n] == b[m]) {
            result.push_back(a[n]);
            n--;
            m--;
        } else if (lcs[n - 1][m] == lcs[n][m]) {
            n--;
        } else {
            m--;
        }
    }

    reverse(result.begin(), result.end());
    for (auto x : result) {
        cout << x << " ";
    }
    cout << "\n";
}
```

:::

### Rectangle Cutting


**题目大意**：$a\times b$ 的矩形（$a, b \le 500$），每次可以沿整数线把某个矩形水平或竖直切成两个，求把整块切成若干正方形所需的最少切割次数。

**解题思路**：设 `moves[i][j]` 为把 $i\times j$ 矩形切成正方形的最少切割次数，`i == j` 时为 0，其余情况先置为 `1e9`。第一刀沿某条整数线：竖直切枚举 $1\le x<i$，代价 `moves[x][j] + moves[i-x][j] + 1`；水平切枚举 $1\le y<j$，代价 `moves[i][y] + moves[i][j-y] + 1`，取所有切法的最小值。转移只依赖更小的矩形，因此按 `i`、`j` 升序计算。答案为 `moves[a][b]`，时间复杂度为 $O(ab(a+b))$，空间复杂度为 $O(ab)$。

:::details[题解(C++)]

```c++
void solve() {
    int a, b;
    cin >> a >> b;

    vector<vector<int>> moves(a + 1, vector<int>(b + 1));
    for (int i = 1; i <= a; ++i) {
        for (int j = 1; j <= b; ++j) {
            if (i == j) {
                moves[i][j] = 0;
            } else {
                moves[i][j] = 1e9;
                for (int x = 1; x < i; ++x) {
                    moves[i][j] =
                        min(moves[i][j], moves[x][j] + moves[i - x][j] + 1);
                }
                for (int y = 1; y < j; ++y) {
                    moves[i][j] =
                        min(moves[i][j], moves[i][y] + moves[i][j - y] + 1);
                }
            }
        }
    }

    cout << moves[a][b] << "\n";
}
```

:::

### Minimal Grid Path


**题目大意**：给定一个 $n\times n$ 的字母网格，从左上角走到右下角，每一步只能向右或向下。路径经过的字母依次组成字符串，求其中字典序最小的一个。

**解题思路**：所有路径的长度都是 $2n-1$，按步数逐层贪心取字典序最小的前缀。先把 `grid[0][0]` 输出，之后每层维护能到达当前最优前缀末尾的格子集合 `level`（初始为 `(0,0)`），扩展出它们右、下的候选格，取其中最小的字母，只保留字母等于该最小值的格子并把该字母接到答案末尾——此前的前缀已经最小，本层再取最小字母即得最小前缀，字母更大的路径不可能反超。`unique` 去掉同层重复的坐标。每层至多 $O(n)$ 个格子、共 $2n-2$ 层，时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<string> grid(n);
    for (int i = 0; i < n; i++) {
        cin >> grid[i];
    }

    cout << grid[0][0];

    vector<pair<int, int>> level;
    level.emplace_back(0, 0);

    for (int i = 0; i < 2 * n - 2; i++) {
        vector<pair<int, int>> next_level;
        char min_letter = 'Z' + 1;

        auto update_next_level = [&](int y, int x) {
            if (y < n && x < n) {
                char letter = grid[y][x];
                if (letter < min_letter) {
                    next_level.clear();
                    min_letter = letter;
                }
                if (letter == min_letter) {
                    next_level.emplace_back(y, x);
                }
            }
        };

        for (auto [y, x] : level) {
            update_next_level(y + 1, x);
            update_next_level(y, x + 1);
        }

        cout << min_letter;

        level = next_level;
        level.erase(unique(level.begin(), level.end()), level.end());
    }
    cout << "\n";
}
```

:::

### Money Sums


**题目大意**：`n` 个硬币（$n \le 100$，面值 $\le 1000$），面值给定，求用这些硬币的任意子集能凑出的所有不同金额，先输出个数，再从小到大列出；例如面值为 $1,2$ 时可凑出 $1,2,3$ 三种金额。

**解题思路**：用 `bitset dp` 维护可达的子集和，`dp[k] = 1` 表示用已处理过的硬币能凑出金额 `k`，初始 `dp[0] = 1`。依次取每枚硬币的面值 `i` 执行 `dp |= dp << i`：`dp << i` 是把所有当前可达金额再选入这枚硬币的结果，与原状态取或即同时保留「不选」的情形；每枚硬币只执行一次，不会被重复选入。全部处理完后 `dp.count() - 1` 就是正金额的个数，再从 1 起从小到大输出所有置位的下标。设位集长度为 $N$，时间复杂度为 $O(nN/64)$，空间复杂度为 $O(N)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
bitset<N> dp;
void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 1; i <= n; i++) cin >> a[i - 1];

    dp[0] = 1;
    for (auto i : a) dp |= (dp << i);
    cout << dp.count() - 1 << '\n';
    for (int i = 1; i < N; i++)            // bitset<N> 合法下标 0..N-1
        if (dp[i])
            cout << i << " ";
    cout << '\n';
}
```

:::

### Removal Game


**题目大意**：`n` 个数（$n \le 5000$）排成一列，两人轮流从**两端**取走一个数并累加到自己的得分，双方都按最优策略行动，求先手最终能得到的最大得分。

**解题思路**：

- **观察**：零和博弈中只需记录当前玩家相对对手的最终分差。设 `score[l]` 为在区间 `[l, r]`（`r = l + len - 1`）上先手相对后手的最大分差：取左端得 $x[l]$，对手随后在 `[l+1, r]` 上相对我方的分差为 `score[l+1]`，净差 $x[l]-\text{score}[l+1]$；取右端同理，净差 $x[r]-\text{score}[l]$（区间 `[l, r-1]`）。

- **做法**：按区间长度从小到大、**原地**更新：$\text{score}[l]=\max\bigl(x[l]-\text{score}[l+1],\,x[r]-\text{score}[l]\bigr)$，长度 1 时 `score[i] = x[i]`。
  
- **正确性**：转移即双方最优策略的收益方程。原地更新时右侧两个 `score` 仍是长度为 `len-1` 的旧值：`l` 从小到大处理，`score[l+1]` 属本层尚未覆盖，`score[l]` 同理。设总和 `sum`、先手得分 $p$，由 $p+q=\text{sum}$、$p-q=\text{score}[0]$ 得 $p=(\text{sum}+\text{score}[0])/2$。时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 5000;
int x[N];
ll score[N];
void solve() {
    int n;
    cin >> n;

    ll sum = 0;
    for (int i = 0; i < n; ++i) {
        cin >> x[i];
        score[i] = x[i];
        sum += x[i];
    }

    for (int len = 2; len <= n; ++len) {
        for (int l = 0; l + len <= n; ++l) {
            int r = l + len - 1;
            score[l] = max(x[l] - score[l + 1], x[r] - score[l]);
        }
    }

    cout << (sum + score[0]) / 2 << '\n';
}
```

:::

### Two Sets II


**题目大意**：将 1 到 `n` 的所有整数（$n \le 500$）分成两个集合，使两个集合的元素和相等。交换两个集合不产生新的划分，求不同划分的数量，答案对 $10^9+7$ 取模；例如 `n = 3` 时只有 $\{1,2\}$ 与 $\{3\}$ 这一种划分。

**解题思路**：

- **做法**：总和 `total = n(n+1)/2` 为奇数时答案为 0；否则目标和 `half = total / 2`。用 0-1 背包计数：`sets[s]` 为已处理数字中和为 `s` 的子集数，初始 `sets[0] = 1`，对 `x = 1..n-1` 令 `s` 从 `half` 倒序更新 `sets[s] += sets[s-x]`（倒序保证每个数至多用一次）。答案为 `sets[half]`。

- **正确性**：每个合法划分中 `n` 恰属于一侧，另一侧不含 `n` 且和为 `half`，划分与 $\{1,\ldots,n-1\}$ 中和为 `half` 的子集一一对应，故只统计 $1$ 到 $n-1$ 的子集即天然去重（交换两集合不重复计数）。时间复杂度为 $O(n\cdot\text{half})=O(n^3)$，空间复杂度为 $O(\text{half})=O(n^2)$。

:::details[题解(C++)]

```c++
const int N = 500 * 501 / 4;
const int M = 1e9 + 7;

int sets[N + 1];
void solve() {
    int n;
    cin >> n;

    int total = n * (n + 1) / 2;
    if (total % 2 != 0) {
        cout << 0 << '\n';
        return;
    }
    int half = total / 2;

    sets[0] = 1;
    for (int x = 1; x < n; ++x) {
        for (int s = half; s - x >= 0; --s) {
            sets[s] = (sets[s] + sets[s - x]) % M;
        }
    }

    cout << sets[half] << '\n';
}
```

:::

### Mountain Range


**题目大意**：`n` 座山排成一列，每座有高度。从一座山出发可以沿滑翔路径"跳到"一座更矮的山，要求它比起点矮、且比两座山之间的所有山都矮（即中间没有比终点更高的山挡路）。求从某一座山出发，一条路线最多能经过多少座山；例如高度为 $3,1,2$ 时最优路线经过 $3\to2\to1$ 三座山。

**解题思路**：

- **观察**：按高度从高到低处理，已处理的山都比当前山高。设 `count(p)` 为以 `p` 结尾（最后落到 `p`）的路线最多经过的山数。能直接滑到 `p` 的山只可能是 `p` 左右两侧最近的已处理位置：更远的高山与 `p` 之间隔着这座最近的高山，而它比 `p` 高，不满足「终点比中间所有山都矮」，被挡住。

- **做法**：`count(p) = 1 + max(count(左邻), count(右邻))`。用 `map<int,int>` 保存已处理位置及其 `count`，哨兵 `0`、`n+1` 的值均为 0；`upper_bound(pos)` 得到右侧最近者，前移一位得左侧最近者。同高度的山之间不能互跳，故同一高度算出的结果先存入 `updates`，进入更低高度时才写入 `counts`；答案取所有 `count` 的最大值。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;

    vector<pair<int, int>> heights;
    for (int i = 1; i <= n; i++) {
        int h;
        cin >> h;
        heights.emplace_back(h, i);
    }
    sort(heights.rbegin(), heights.rend());

    map<int, int> counts;
    counts[0] = 0;
    counts[n + 1] = 0;

    int prev_height = 0;
    vector<pair<int, int>> updates;
    int result = 0;

    for (auto [height, pos] : heights) {
        if (height != prev_height) {
            for (auto [pos, count] : updates) {
                counts[pos] = count;
            }
            updates.clear();
            prev_height = height;
        }

        auto it = counts.upper_bound(pos);
        int next_pos = it->first;
        it--;
        int prev_pos = it->first;

        int new_count = max(counts[prev_pos], counts[next_pos]) + 1;
        updates.emplace_back(pos, new_count);
        result = max(result, new_count);
    }

    cout << result << "\n";
}
```

:::

### Increasing Subsequence


**题目大意**：求数组（$n \le 2 \times 10^5$）中最长严格递增子序列（LIS）的长度。

**解题思路**：树状数组维护值域前缀中的最大 LIS 长度。先把值离散化（排序去重后映射为从 1 开始的排名）。`g(p)` 查询离散值 $\le p$ 的元素能形成的最长递增子序列，`f(p, v)` 用 `v` 更新位置 `p`。以 `a[i]` 结尾的 LIS 为 `g(a[i]-1) + 1`（接在值更小的子序列后），再用它更新位置 `a[i]`；查询排除相等值，保证严格递增。答案为所有新长度的最大值。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;

int tr[N];
void f(int p, int v) {
    for (; p < N; p += ((p) & -(p))) tr[p] = max(tr[p], v);
}
int g(int p) {
    int res = 0;
    for (; p; p -= ((p) & -(p))) res = max(res, tr[p]);
    return res;
}
void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 1; i <= n; i++) cin >> a[i - 1];
    vector<int> b = a;
    sort(b.begin(), b.end());
    unique(b.begin(), b.end());
    int cnt = b.size();
    for (int i = 1; i <= n; i++)
        a[i - 1] = lower_bound(b.begin(), b.end(), a[i - 1]) - b.begin() + 1;
    int ans = 0;
    for (int i = 0; i <= n - 1; i++) {
        int x = g(a[i] - 1) + 1;
        ans = max(ans, x);
        f(a[i], x);
    }
    cout << ans << '\n';
}
```

:::

### Projects


**题目大意**：给定 `n` 个项目（$n \le 2 \times 10^5$），每个项目都有开始日期、结束日期和奖励。选择的任意两个项目都不能在同一天进行，求能够获得的最大奖励总和。

**解题思路**：把每个项目拆成开始事件与结束事件，按时间排序（同日时 `is_end = false` 的开始事件排在前）。`result` 为已结束项目能取得的最大奖励，`money[i]` 为选项目 `i` 后的最大奖励：开始事件时 `money[i] = result + p[i]`（此时 `result` 只含结束日期严格早于当前日期的项目）；结束事件时用 `money[i]` 更新 `result`。同日开始的事件排在结束之前，保证同日结束的项目不能接续同日开始的项目。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
struct Event {
    int time, project;
    bool is_end;
    bool operator<(Event other) const {
        if (time == other.time)
            return is_end < other.is_end;
        return time < other.time;
    }
};
void solve() {
    int n;
    cin >> n;
    vector<int> p(n);
    vector<ll> money(n);
    vector<Event> events;
    for (int i = 0; i < n; ++i) {
        int a, b;
        cin >> a >> b >> p[i];
        events.push_back({a, i, false});
        events.push_back({b, i, true});
        money[i] = 0;
    }

    sort(events.begin(), events.end());

    ll result = 0;
    for (auto [time, project, is_end] : events) {
        if (is_end) {
            result = max(result, money[project]);
        } else {
            money[project] = result + p[project];
        }
    }

    cout << result << '\n';
}
```

:::

### Elevator Rides


**题目大意**：`n` 个人（$n \le 20$）体重已知，电梯一次最多载重 `x`，每次载一批人往返一趟，求把所有人送到顶楼所需的最少趟数。

**解题思路**：`best[s]` 为二元组（已用趟数, 最后一趟当前载重），表示送完集合 `s` 的最优安排；`pair` 的字典序比较先最小化趟数、再最小化最后一趟载重（载重越小越有利于继续载人）。初始 `best[0] = {1, 0}`（尚未载人的第一趟也计入）。按 `s` 从小到大枚举（`s ^ (1 << p)` 是 `s` 的真子集，必定已经算好），先把 `best[s]` 置为 `{n + 1, 0}`，再枚举最后加入的人 `p`：若 `best[s ^ (1 << p)]` 的载重加 `w[p]` 不超过 `x`，则把人放进当前趟得 `{r, l + w[p]}`；否则新开一趟得 `{r + 1, w[p]}`；取字典序最小的方案。答案为 `best[(1 << n) - 1].first`，时间复杂度为 $O(n2^n)$，空间复杂度为 $O(2^n)$。

:::details[题解(C++)]

```c++
const int N = 20;
pair<int, int> best[1 << N];
void solve() {
    int n, x;
    cin >> n >> x;

    vector<int> w(n);
    for (int i = 0; i < n; ++i) cin >> w[i];

    best[0] = {1, 0};
    for (int s = 1; s < (1 << n); ++s) {
        best[s] = {n + 1, 0};

        for (int p = 0; p < n; ++p) {
            if (s & (1 << p)) {
                auto [r, l] = best[s ^ (1 << p)];
                pair<int, int> added;
                if (l + w[p] <= x) {
                    added = {r, l + w[p]};
                } else {
                    added = {r + 1, w[p]};
                }
                best[s] = min(best[s], added);
            }
        }
    }

    cout << best[(1 << n) - 1].first << '\n';
}
```

:::

### Counting Tilings


**题目大意**：用 $1\times2$ 和 $2\times1$ 的骨牌铺满 $n\times m$ 网格，求不同铺法的数量。其中 $n \le 10$、$m \le 1000$，答案对 $10^9+7$ 取模；例如 $2\times2$ 网格有 2 种铺法。

**解题思路**：

- **观察**：逐列转移，一列的状态只需记录哪些格被伸向下一列的横向骨牌占用，用 `n` 位掩码表示；$n\le10$ 使状态数 $2^n$ 可行。

- **做法**：先用 `generate(i, left, right)` 枚举一列内的覆盖方式：`left` 第 `i` 位为 1 表示上一列有横向骨牌伸入本列（本格已覆盖），`right` 第 `i` 位为 1 表示本格放一块伸向右列的横向骨牌。递归时有三种选择：把 `left` 的第 `i` 位置 1（本格由左列的骨牌覆盖）、把 `right` 的第 `i` 位置 1（本格放骨牌伸向右列）、或放一块竖向骨牌覆盖本列第 `i`、`i+1` 行并跳到 `i+2`；到 `i == n` 时该列被完整覆盖，`(left, right)` 是一组合法转移，越界的竖向骨牌（`i > n`）则丢弃。DP 部分设 `prev[x]` 为已处理若干列、边界状态为 `x`（下一列的这些格已被本列伸出的横向骨牌占用）的方案数，初始 `prev[0] = 1`；每处理一列，清空 `cur` 后对所有合法转移 `(x, y)` 执行 `cur[y] += prev[x]`，再交换 `cur` 与 `prev`。处理完 `m` 列后状态 0 表示没有骨牌伸出网格，答案为 `prev[0]`。设合法转移数为 $T$，预处理时间复杂度为 $O(T)$，总时间复杂度为 $O(mT)$，空间复杂度为 $O(2^n)$。

:::details[题解(C++)]

```c++
const int M = 1e9 + 7;

int n;
vector<pair<int, int>> transitions;

void generate(int i, int left, int right) {
    if (i > n)
        return;
    if (i == n) {
        transitions.emplace_back(left, right);
        return;
    }
    generate(i + 1, left | 1 << i, right);
    generate(i + 1, left, right | 1 << i);
    generate(i + 2, left, right);
}

void solve() {
    int m;
    cin >> n >> m;

    generate(0, 0, 0);

    vector<int> cur(1 << n), prev(1 << n);
    prev[0] = 1;

    for (int i = 0; i < m; ++i) {
        fill(cur.begin(), cur.end(), 0);

        for (auto [x, y] : transitions) {
            cur[y] += prev[x];
            cur[y] %= M;
        }

        swap(cur, prev);
    }

    cout << prev[0] << '\n';
}
```

:::

### Counting Numbers


**题目大意**：统计闭区间 `[a, b]` 内（$a, b \le 10^{18}$）、十进制表示中**没有两个相邻数字相同**的整数个数；例如 11 与 100 因存在相邻相同数字而不合要求，10 与 121 则符合。

**解题思路**：

- **做法**：把区间计数拆成 `count(b) - count(a-1)`，其中 `count(x)` 统计 0 到 `x` 中满足条件的整数个数。数位 DP 递归 `recurse(i, prev, equal, empty)`：正在填第 `i` 位，`prev` 为上一位数字，`equal` 表示当前前缀是否仍与上界 `s` 完全相同，`empty` 表示之前是否全是前导零。枚举当前位数字 `d`：`equal` 为真时 `d` 不能超过 `s[i] - '0'`；已经出现非零数字（`!empty`）时 `d` 不能等于 `prev`；递归进新状态 `(i + 1, d, equal && d == s[i] - '0', empty && d == 0)`，填满所有位（`i == s.size()`）时返回 1。每个四元组状态用 `map` 记忆化，只计算一次。

- **边界**：前导零不参与相邻数字比较，位数更短的整数由补前导零的路径自然被统计；全前导零的路径对应整数 0，故 `count(0) = 1`。`count(x)` 在 `x < 0` 时直接返回 0，因此 `a = 0` 时 `count(a-1) = 0`。每次调用 `count` 先用 `lookup.clear()` 清空记忆化，不同上界之间不会串用结果。设位数为 $L$，状态数为 $O(40L)$、每个状态枚举 10 个数字，时间复杂度为 $O(L)$ 量级，空间复杂度为 $O(L)$。

:::details[题解(C++)]

```c++
string s;
map<array<int, 4>, ll> lookup;

ll recurse(int i, int prev, bool equal, bool empty) {
    if (i == (int)s.size())
        return 1;

    array<int, 4> params{i, prev, equal, empty};
    if (lookup.count(params))
        return lookup[params];

    ll result = 0;
    for (int d = 0; d < 10; ++d) {
        if (equal && d > s[i] - '0')
            break;
        if (!empty && d == prev)
            continue;
        result += recurse(i + 1, d, equal && d == s[i] - '0', empty && d == 0);
    }

    lookup[params] = result;
    return result;
}

ll count(ll x) {
    if (x < 0)
        return 0;
    s = to_string(x);
    lookup.clear();
    return recurse(0, 0, true, true);
}
void solve() {
    ll a, b;
    cin >> a >> b;
    cout << count(b) - count(a - 1) << '\n';
}
```

:::

### Increasing Subsequence II


**题目大意**：统计数组（$n \le 2 \times 10^5$）中**严格递增子序列**的总个数（值严格递增，不同位置组成的序列算不同），答案对 $10^9+7$ 取模。

**解题思路**：先离散化，再用树状数组按值维护递增子序列数量的前缀和：`sum(x)` 查询末尾值 $\le x$ 的子序列总数，`add(x, v)` 把 `v` 累加到末尾值为 `x` 的位置。处理 `b[i]` 时，以它结尾的子序列为：单独自身（1 种）+ 接在任何末尾值 $< b[i]$ 的递增子序列后（`sum(b[i]-1)` 种），即 `num = sum(b[i]-1) + 1`；再把 `num` 累加进 `add(b[i], num)` 并计入总答案。查询排除相等值，保证严格递增；不同位置结尾的子序列分别计数。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
const int mod = 1e9 + 7;

ll BIT[N];
void add(int x, ll v) {
    for (; x <= 2e5; x += ((x) & -(x))) BIT[x] = (v + BIT[x]) % mod;
}
ll sum(int x) {
    ll ans = 0;
    for (; x; x -= ((x) & -(x))) ans = (ans + BIT[x]) % mod;
    return ans;
}
int n;
int a[N], b[N];
void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i], b[i] = a[i];
    sort(a + 1, a + n + 1);
    int len = unique(a + 1, a + n + 1) - a - 1;
    for (int i = 1; i <= n; i++)
        b[i] = lower_bound(a + 1, a + len + 1, b[i]) - a;
    ll ans = 0;
    for (int i = 1; i <= n; i++) {
        ll num = (sum(b[i] - 1) + 1) % mod;
        add(b[i], num);
        ans = (ans + num) % mod;
    }
    cout << ans << '\n';
}
```

:::
