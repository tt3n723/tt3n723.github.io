---
title: "CSES 数学与计数"
description: "本篇包含：Mathematics（37 题）、Counting Problems（18 题）。共 55 题。"
pubDate: 2026-05-04T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/15.jpg"
---
本篇包含：Mathematics（37 题）、Counting Problems（18 题）。共 55 题。



## Mathematics

### Josephus Queries


**题目大意**：`q` 次询问（$q \le 10^5$），每次给 `n` 个孩子围成一圈（$n, k \le 10^9$）。从第 1 个孩子开始数，每隔一个孩子就被从圈子里带走，问第 `k` 个被移除的孩子是谁。

**解题思路**：

- **做法**：递归把规模减半。$k \le \frac{n+1}{2}$ 时第 `k` 个被移除者在第一轮：这一轮按「隔一个移除一个」依次移除 $2, 4, 6, \ldots$，答案为 `2 * k`；`2 * k > n` 时表示已绕回圈头，代码对它取模。否则第一轮后圈里只剩奇数编号的孩子，按圈序把它们重新编号为 $1..\lfloor n/2 \rfloor$，递归求出子问题答案 `t` 后再换回原编号：`n` 为偶数时 `2 * t - 1`，奇数时 `2 * t + 1`。

- **正确性**：第一轮移除 $2, 4, \ldots$，`n` 为奇数时圈尾之后接回 1 号、1 号也在这一轮被移除，故共移除 $\lceil n/2 \rceil$ 个。幸存的奇数编号按圈序重编号时，`n` 为偶数则幸存者为 $1, 3, \ldots, n-1$，对应 $t \mapsto 2t-1$；`n` 为奇数则幸存者为 $3, 5, \ldots, n$，对应 $t \mapsto 2t+1$。每次递归把 `n` 减半，总时间复杂度为 $O(q\log n)$，空间复杂度为 $O(\log n)$（递归深度）。

:::details[题解(C++)]

```c++
ll jos(ll n, ll k) {
    if (n == 1)
        return 1;
    if (k <= (n + 1) / 2)
        return 2 * k > n ? (2 * k) % n : 2 * k;
    ll t = jos(n / 2, k - (n + 1) / 2);
    return n % 2 ? 2 * t + 1 : 2 * t - 1;
}
void solve() {
    int q;
    cin >> q;
    while (q--) {
        ll n, k;
        cin >> n >> k;
        cout << jos(n, k) << '\n';
    }
}
```

:::

### Exponentiation


**题目大意**：`n` 次询问，每次计算 $a^b \bmod 10^9+7$（$0 \le a, b \le 10^9$，约定 $0^0 = 1$）。

**解题思路**：快速幂。把指数按二进制拆开：若指数二进制中为 1 的位是 $2^{e_1}, \ldots, 2^{e_k}$，则 $a^b$ 等于这些位上对应幂的乘积，故只要能在 $O(\log b)$ 次乘法内求出全部 $a^{2^{e_i}}$ 即可。`qpow` 中形参 `a` 每轮自乘一次，依次保存 $a^{1}, a^{2}, a^{4}, \ldots$；形参 `n` 的最低位 `n & 1` 为 1 时把当前 `a` 乘进 `res`，随后 `a` 自乘、`n` 右移一位，故 `res` 恰好乘入了所需因子之积。每次询问的时间复杂度为 $O(\log b)$，总时间复杂度为 $O(n\log b)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
ll qpow(ll a, ll n) {
    ll res = 1;
    while (n) {
        if (n & 1)
            res = res * a % mod;
        a = a * a % mod;
        n >>= 1;
    }
    return res;
}
void solve() {
    ll a, n;
    cin >> a >> n;
    cout << qpow(a, n) << '\n';
}
```

:::

### Exponentiation II


**题目大意**：`n` 次询问，每次计算 $a^{b^c} \bmod 10^9+7$（$a, b, c \le 10^9$）。

**解题思路**：

- **观察**：模数 $p = 10^9+7$ 是质数。费马小定理指出 $p \nmid a$ 时 $a^{p-1} \equiv 1 \pmod p$；本题 $a \le 10^9 < p$，只要 $a \ne 0$ 就有 $\gcd(a, p) = 1$，前提成立，于是指数可以在模 $p-1$ 的意义下化简：$a^{b^c} \equiv a^{\,b^c \bmod (p-1)} \pmod p$。

- **做法**：先算 $b^c \bmod (p-1)$，再算 $a$ 的该次幂模 $p$，两次都用带模参数的快速幂 `power(a, b, m)`，即 `power(a, power(b, c, 1e9 + 6), 1e9 + 7)`，其中 $p-1 = 10^9+6$。`power` 在 $b = 0$ 时返回 `1 % m`，与 $0^0 = 1$ 的约定一致；第二次幂的指数已降到 $p-1$ 以内，规模为 $O(\log p)$。每组询问的时间复杂度为 $O(\log c + \log p)$，空间复杂度为 $O(\log c)$（递归深度）。

:::details[题解(C++)]

```c++
int power(int a, int b, int m) {
    if (b == 0)
        return 1 % m;
    ll p = power(a, b / 2, m);
    p = p * p % m;
    if (b % 2 == 1)
        p = p * a % m;
    return p;
}
void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int a, b, c;
        cin >> a >> b >> c;
        cout << power(a, power(b, c, 1e9 + 6), 1e9 + 7) << "\n";
    }
}
```

:::

### Counting Divisors


**题目大意**：`n` 次询问（$n \le 10^5$），每次给出 `x`（$x \le 10^6$），输出 `x` 的约数个数。

**解题思路**：约数成对出现：若 `k` 是 `x` 的约数，则 `x / k` 也是，且 $k \le \sqrt{x}$ 的约数与 $k > \sqrt{x}$ 的约数一一配对。枚举 `k` 从 1 到 $\sqrt{x}$，`x % k == 0` 时 `k` 与 `x / k` 各是一个约数，代码先累加 `k`，仅在 `k != x / k` 时再累加一次，故完全平方数的平方根不会被重复计数。单次询问的时间复杂度为 $O(\sqrt{x})$，总时间复杂度为 $O(n\sqrt{x})$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
int count(int x) {
    int c = 0;
    for (int k = 1; k * k <= x; k++) {
        if (x % k)
            continue;
        c++;
        if (k != x / k)
            c++;
    }
    return c;
}
void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        cout << count(x) << "\n";
    }
}
```

:::

### Common Divisors


**题目大意**：给 `n` 个数（$n \le 2 \times 10^5$，每个数 $\le 10^6$），求 $\max_{i<j} \gcd(a_i, a_j)$，即任意两个下标不同的数的最大公约数的最大值（两数数值可以相同）。

**解题思路**：值域只有 $10^6$，改为枚举候选答案。`cnt[x]` 统计每个数值的出现次数（`M = 1000000`）；从大到小枚举候选公因数 `d`，用 $d, 2d, 3d, \ldots$ 累加 `cnt` 得到被 `d` 整除的数的个数，全部 `d` 的总枚举量为调和级数 $\sum_{d=1}^{M} M/d = O(M\log M)$。第一个满足「个数 $\ge 2$」的 `d` 即为答案：它至少整除两个下标不同的数，故是一个可行的公约数；而比它大的候选都已检查且不满足，故它是最大的。时间复杂度为 $O(M\log M)$，空间复杂度为 $O(M)$。

:::details[题解(C++)]

```c++
const int M = 1000000;
void solve() {
    int n;
    cin >> n;
    vector<int> cnt(M + 1);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cnt[x]++;
    }
    for (int d = M; d >= 1; d--) {
        int c = 0;
        for (int m = d; m <= M; m += d) c += cnt[m];
        if (c >= 2) {
            cout << d << '\n';
            return;
        }
    }
}
```

:::

### Sum of Divisors


**题目大意**：求 $\sum_{x=1}^{n} \sigma(x) \bmod 10^9+7$，其中 $\sigma(x)$ 是 `x` 的约数之和，$n \le 10^{12}$。

**解题思路**：

- **观察**：换成按约数统计：把每个约数 `d` 在 $x = d, 2d, 3d, \ldots$ 中被各计一次，则 `d` 在 $1..n$ 中共出现 $\lfloor n/d \rfloor$ 次，故 $\sum_{x=1}^{n} \sigma(x) = \sum_{d=1}^{n} d \cdot \lfloor n/d \rfloor$。

- **做法**：$\lfloor n/d \rfloor$ 只有 $O(\sqrt{n})$ 种取值，可用数论分块求和：块起点为 `l`，令 `q = n / l`，则块终点 `r = n / q`，块内所有 `d` 都满足 $\lfloor n/d \rfloor = q$；块内 `d` 之和为等差数列 $\frac{(l+r)(r-l+1)}{2}$，代码把除以 2 换成乘 2 的逆元 `(MOD + 1) / 2`（$2 \cdot \frac{p+1}{2} = p+1 \equiv 1 \pmod p$），再乘 `q` 累加。时间复杂度为 $O(\sqrt{n})$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    ll n;
    cin >> n;
    ll ans = 0;
    for (ll l = 1, r; l <= n; l = r + 1) {
        ll q = n / l;
        r = n / q;
        ll len = r - l + 1;
        ll sum = ((l + r) % MOD) * (len % MOD) % MOD * ((MOD + 1) / 2) % MOD;
        ans = (ans + sum * (q % MOD)) % MOD;
    }
    cout << ans << '\n';
}
```

:::

### Divisor Analysis


**题目大意**：输入一个整数的质因数分解：第一行给出质因子个数 `n`，随后 `n` 行每行是质数 `x` 及其指数 `k`（$x \le 10^6$，$k \le 10^9$）。求该整数的约数个数、约数之和、约数之积，三者都输出模 $10^9+7$ 的结果。

**解题思路**：

- **做法**：设 $N = \prod_i x_i^{k_i}$，三个量都按质因子的指数组合求。约数个数：每个 $x_i$ 的指数可以取 $0..k_i$ 共 $k_i+1$ 种，各质因子的选择互相独立，故 `cnt` $= \prod_i (k_i+1)$。约数之和：把 $\prod_i (1 + x_i + x_i^2 + \cdots + x_i^{k_i})$ 展开，每一项 $x_1^{e_1} \cdots x_n^{e_n}$ 恰对应一个约数且不重不漏，故对每个质因子用等比数列求和 $(x_i^{k_i+1}-1) \cdot (x_i-1)^{-1}$ 再相乘，逆元由快速幂 `power(x[i] - 1, MOD - 2, MOD)` 给出。约数之积：把每个约数 `d` 与 $N/d$ 配对，同一对的乘积是 $N$，故全部约数之积为 $N^{cnt/2}$（`cnt` 为奇数时 $N$ 是完全平方数，最中间的约数 $\sqrt{N}$ 与自己配对，乘积仍等于 $N^{cnt/2}$）。

- **实现**：$N^{cnt/2}$ 中 $x_i$ 的指数是 $k_i \cdot cnt/2$，这里的除以 2 不能在模 $p-1$ 下直接进行（$p-1$ 是偶数，逆元不存在，且会丢失 `cnt` 的奇偶信息）。代码改在模 $2(p-1)$ 下计算：先求出 `cnt2` $= cnt \bmod 2(p-1)$，再令 `t` $= (k_i \bmod 2(p-1)) \cdot cnt2 \bmod 2(p-1)$。`t` 必定是偶数：`cnt` 为偶数时 $k_i \cdot cnt$ 为偶数，`cnt` 为奇数时约数个数为奇数迫使每个 $k_i$ 都是偶数，两种情况下取模（模数为偶数，不改变奇偶性）后仍为偶数。于是 `t / 2` 就是 $k_i \cdot cnt/2 \bmod (p-1)$ 的正确取值，用它作指数做快速幂即可（$x_i < p$，费马小定理保证指数可对 $p-1$ 取模），代码写作 `(t / 2) % (MOD - 1)`。

- **边界**：质数 `x[i]` 不小于 2，故 `x[i] - 1` 在模 $10^9+7$ 下可逆。时间复杂度为 $O(n\log k)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const ll MOD2 = 2 * (MOD - 1);
ll power(ll a, ll b, ll m)
{
    ll r = 1;
    a %= m;
    while (b)
    {
        if (b & 1) r = r * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return r;
}
void solve()
{
    int n;
    cin >> n;
    vector<ll> x(n), k(n);
    ll cnt = 1, cnt2 = 1;
    for (int i = 0; i < n; i++)
    {
        cin >> x[i] >> k[i];
        cnt = cnt * (k[i] + 1) % MOD;
        cnt2 = cnt2 * ((k[i] + 1) % MOD2) % MOD2;
    }
    ll sum = 1;
    for (int i = 0; i < n; i++)
    {
        ll geom = (power(x[i], k[i] + 1, MOD) - 1 + MOD) % MOD;
        geom = geom * power(x[i] - 1, MOD - 2, MOD) % MOD;
        sum = sum * geom % MOD;
    }
    ll prod = 1;
    for (int i = 0; i < n; i++)
    {
        ll t = (k[i] % MOD2) * cnt2 % MOD2;
        ll e = (t / 2) % (MOD - 1);
        prod = prod * power(x[i], e, MOD) % MOD;
    }
    cout << cnt << ' ' << sum << ' ' << prod << '\n';
}
```

:::

### Prime Multiples


**题目大意**：给 `k` 个两两不同的质数（$k \le 20$），求 $1..n$（$n \le 10^{18}$）中有多少个数能被至少一个质数整除。

**解题思路**：

- **观察**：设 $A_i$ 为被第 `i` 个质数整除的数组成的集合，要求 $|\bigcup_i A_i|$，用容斥原理展开：按非空子集 $S$ 求交求和，$|\bigcap_{i \in S} A_i|$ 即 $1..n$ 中被 $S$ 内全部质数整除的数。每个数按「整除它的质数个数」被加减，最终只在整除个数不少于 1 时净计 1 次。

- **做法**：枚举所有非空子集 `mask`，子集内质数之积为 `prod`。因为各质数两两不同、两两互质，$|\bigcap_{i \in S} A_i| = \lfloor n/prod \rfloor$。`mask` 的置位数 `bits` 为奇数则加、偶数则减。`prod` 声明为 `__int128` 并在乘入 `a[i]` 之前用 `prod > n / a[i]` 判断乘积是否会超过 `n`，一旦超过就直接跳过该子集（此时 $\lfloor n/prod \rfloor = 0$，贡献为零）。时间复杂度为 $O(k \cdot 2^k)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
void solve() {
    ll n;
    int k;
    cin >> n >> k;
    vector<ll> a(k);
    for (int i = 0; i < k; i++) cin >> a[i];
    ll ans = 0;
    for (int mask = 1; mask < (1 << k); mask++) {
        __int128 prod = 1;
        int bits = 0;
        bool over = false;
        for (int i = 0; i < k; i++)
            if (mask >> i & 1) {
                bits++;
                if (prod > n / a[i]) {
                    over = true;
                    break;
                }
                prod *= a[i];
            }
        if (over)
            continue;
        if (bits & 1)
            ans += n / (ll)prod;
        else
            ans -= n / (ll)prod;
    }
    cout << ans << '\n';
}
```

:::

### Counting Coprime Pairs


**题目大意**：给 `n` 个数（$n \le 10^5$，每个数 $\le 10^6$），统计两个下标不同、最大公约数为 1 的数对数量。

**解题思路**：

- **观察**：莫比乌斯函数 $\mu$ 满足 $\sum_{d \mid m} \mu(d) = [m = 1]$，取 $m = \gcd(a, b)$ 即得「$\gcd(a, b)$ 恰为 1」的指示函数 $\sum_{d \mid \gcd(a, b)} \mu(d)$。把数对的求和与外层求和交换次序：$d \mid \gcd(a, b)$ 等价于 $a$、$b$ 都被 `d` 整除，故所求数对数为 $\sum_{d} \mu(d) \binom{c(d)}{2}$，其中 `c(d)` 是能被 `d` 整除的元素个数，$\binom{c(d)}{2}$ 即在这 `c(d)` 个数中任取两个下标配成一对。

- **做法**：用线性筛求出 $M = 10^6$ 以内的 `mu`（每个合数只被它的最小质因子筛掉一次：`i % p == 0` 时 $\mu(i \cdot p) = 0$ 并结束内层，否则 $\mu(i \cdot p) = -\mu(i)$）；`freq` 统计各数值的出现次数，对每个 $\mu(d) \ne 0$ 的 `d` 用调和级数枚举倍数 $d, 2d, 3d, \ldots$ 累加 `freq` 得到 `c(d)`，再累加 $\mu(d) \cdot c(d) \cdot (c(d) - 1) / 2$（即 $\mu(d) \binom{c(d)}{2}$）。时间复杂度为 $O(M\log M)$，空间复杂度为 $O(M)$。

:::details[题解(C++)]

```c++
const int M = 1000000;
int mu[M + 1];
void solve() {
    vector<int> primes;
    vector<bool> comp(M + 1);
    mu[1] = 1;
    for (int i = 2; i <= M; i++) {
        if (!comp[i]) {
            primes.push_back(i);
            mu[i] = -1;
        }
        for (int p : primes) {
            if (1LL * i * p > M)
                break;
            comp[i * p] = true;
            if (i % p == 0) {
                mu[i * p] = 0;
                break;
            }
            mu[i * p] = -mu[i];
        }
    }
    int n;
    cin >> n;
    vector<ll> freq(M + 1);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        freq[x]++;
    }
    ll ans = 0;
    for (int d = 1; d <= M; d++) {
        if (!mu[d])
            continue;
        ll c = 0;
        for (int m = d; m <= M; m += d) c += freq[m];
        ans += mu[d] * c * (c - 1) / 2;
    }
    cout << ans << '\n';
}
```

:::

### Next Prime


**题目大意**：`t` 次询问，每次给一个正整数 `n`，输出大于 `n` 的最小质数。

**解题思路**：

- **观察**：Miller-Rabin 素性测试。把 $n-1$ 写成 $d \cdot 2^s$（`d` 为奇数）：若 $n$ 为质数，则对任意底数 $a$ 都有 $a^d \equiv 1 \pmod n$，或者在 $a^{d}, a^{2d}, \ldots, a^{2^{s-1}d}$ 平方的过程中出现 $n-1$；两个条件都不满足时 `n` 必为合数。代码使用的底数集合 $\{2, 3, 5, \ldots, 37\}$ 在 64 位整数范围内是确定正确的。

- **做法**：`isPrime` 先用上述小质数试除（能整除时返回 `n == p`，从而顺带处理 $n < 2$ 与 $n$ 恰为小质数的情形），再对同一组底数做检验；`mulmod` 用 `__int128` 承接 64 位乘法防溢出。每次询问从 `n + 1` 起逐个递增测试直到命中质数——相邻质数之间的间隙很小，故实际询问次数不多。每次测试的时间复杂度为 $O(\log^2 n)$（$O(\log n)$ 次模乘，每次模乘按 $O(\log n)$ 次位运算计），总时间复杂度为 $O(\text{间隙} \cdot \log^2 n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
ll mulmod(ll a, ll b, ll m) { return (__int128)a * b % m; }
ll powmod(ll a, ll b, ll m) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = mulmod(r, a, m);
        a = mulmod(a, a, m);
        b >>= 1;
    }
    return r;
}
bool isPrime(ll n) {
    if (n < 2)
        return false;
    for (ll p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
        if (n % p == 0)
            return n == p;
    }
    ll d = n - 1, s = 0;
    while (d % 2 == 0) {
        d /= 2;
        s++;
    }
    for (ll a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
        if (a >= n)
            continue;
        ll x = powmod(a, d, n);
        if (x == 1 || x == n - 1)
            continue;
        bool ok = false;
        for (int i = 0; i < s - 1; i++) {
            x = mulmod(x, x, n);
            if (x == n - 1) {
                ok = true;
                break;
            }
        }
        if (!ok)
            return false;
    }
    return true;
}
void solve() {
    int t;
    cin >> t;
    while (t--) {
        ll n;
        cin >> n;
        for (ll x = n + 1;; x++)
            if (isPrime(x)) {
                cout << x << '\n';
                break;
            }
    }
}
```

:::

### Binomial Coefficients


**题目大意**：`n` 次询问（$n \le 10^5$），每次求 $\binom{a}{b} \bmod 10^9+7$（$0 \le b \le a \le 10^6$）。

**解题思路**：预处理阶乘与阶乘逆元。由 $\binom{a}{b} = \frac{a!}{b!\,(a-b)!}$ 可知只需维护 `fac[i]` $= i!$ 与 `invfac[i]` $= (i!)^{-1}$；模质数 $p$ 下每个非零元的逆元由 $x \cdot x^{p-2} \equiv 1 \pmod p$ 给出，故 `invfac[M]` 用快速幂算出 `fac[M]` 的逆元，再由 $\frac{1}{(i-1)!} = \frac{i}{i!}$ 倒推出 `invfac[i - 1] = invfac[i] * i`，整张表在 $O(M)$ 内建好。阶乘上界 `M = 1000000` 与 $a$ 的最大值一致；题面保证 $b \le a$，故代码直接输出 `fac[a] * invfac[b] % MOD * invfac[a - b] % MOD`，不会越界。预处理时间复杂度为 $O(M)$，每次询问的时间复杂度为 $O(1)$，空间复杂度为 $O(M)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const int M = 1000000;
ll fac[M + 1], invfac[M + 1];
ll power(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
void solve() {
    fac[0] = 1;
    for (int i = 1; i <= M; i++) fac[i] = fac[i - 1] * i % MOD;
    invfac[M] = power(fac[M], MOD - 2);
    for (int i = M; i >= 1; i--) invfac[i - 1] = invfac[i] * i % MOD;
    int n;
    cin >> n;
    while (n--) {
        int a, b;
        cin >> a >> b;
        cout << fac[a] * invfac[b] % MOD * invfac[a - b] % MOD << '\n';
    }
}
```

:::

### Creating Strings II


**题目大意**：给定一个只含小写字母的字符串 `s`（$|s| \le 10^6$），把它的字符重新排列，求能组成多少个不同的字符串，对 $10^9+7$ 取模。

**解题思路**：多重集排列数。先假想所有字符互不相同，共 $n!$ 种排列；对每种字符 `c`，它的 $cnt[c]$ 个相同副本在 $n!$ 的计数中被重复换位了 $cnt[c]!$ 次，而不同字符的重复因子互不影响，故不同字符串数为 $\frac{n!}{\prod_c cnt[c]!}$。代码用 `cnt[26]` 统计各字符出现次数、预处理 `fac[0..n]`，再用 `power(fac[c], MOD - 2)` 逐个把阶乘的逆元乘进去。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
ll power(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
void solve() {
    string s;
    cin >> s;
    int n = s.size();
    vector<ll> fac(n + 1);
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % MOD;
    vector<int> cnt(26);
    for (char c : s) cnt[c - 'a']++;
    ll ans = fac[n];
    for (int c : cnt) ans = ans * power(fac[c], MOD - 2) % MOD;
    cout << ans << '\n';
}
```

:::

### Distributing Apples


**题目大意**：把 `m` 个完全相同的苹果分给 `n` 个孩子（$n, m \le 10^6$），每个孩子可以拿任意多个（包括 0 个），求方案数对 $10^9+7$ 取模的结果。

**解题思路**：隔板法。把 `n` 个孩子看成 `n` 段：把 `m` 个苹果与 $n-1$ 个隔板排成一行，共 $n+m-1$ 个位置，任选其中 `m` 个位置放苹果——每种选法唯一确定各段中的苹果数（即各孩子所得），反之每种分配也唯一对应一种选法，故答案为 $\binom{n+m-1}{m}$。代码预处理阶乘与逆元，数组开到 `M = 2000001` 以覆盖 $n+m-1$ 的最大值 $2 \times 10^6 - 1$。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const int M = 2000001;
ll fac[M + 1], invfac[M + 1];
ll power(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
ll C(int n, int k) {
    if (k < 0 || k > n)
        return 0;
    return fac[n] * invfac[k] % MOD * invfac[n - k] % MOD;
}
void solve() {
    fac[0] = 1;
    for (int i = 1; i <= M; i++) fac[i] = fac[i - 1] * i % MOD;
    invfac[M] = power(fac[M], MOD - 2);
    for (int i = M; i >= 1; i--) invfac[i - 1] = invfac[i] * i % MOD;
    int n, m;
    cin >> n >> m;
    cout << C(n + m - 1, m) << '\n';
}
```

:::

### Christmas Party


**题目大意**：`n` 个孩子各带一份礼物（$n \le 10^6$），把 `n` 份礼物重新分给这 `n` 个孩子（每人恰好一份），求没有人拿到自己那份礼物的方案数（即错排数），对 $10^9+7$ 取模。

**解题思路**：

- **做法**：设 `der[i]` 为 $i$ 个人的错排数，`der[1] = 0`（只有一人时无解）、`der[2] = 1`（两人只能互换）。对 $i \ge 3$，按 1 号拿了谁的礼物分情况讨论，1 号有 $i-1$ 种选择。

- **正确性**：设 1 号拿了 `j` 号的礼物。若 `j` 也拿了 1 号的礼物，则两人已经互换、其余 $i-2$ 人任意错排，共 `der[i - 2]` 种；若 `j` 不拿 1 号的礼物，则把 1 号的那份礼物看作「`j` 号自己的礼物」——此时 `j` 与其余 $i-2$ 人各有一份不允许拿的礼物，恰是 $i-1$ 个人的错排，共 `der[i - 1]` 种。两类互不重叠且覆盖全部方案，故 `der[i] = (i - 1) * (der[i - 1] + der[i - 2]) % MOD`。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const int N = 1000000;
ll der[N + 1];
void solve() {
    int n;
    cin >> n;
    der[1] = 0;
    der[2] = 1;
    for (int i = 3; i <= n; i++)
        der[i] = (i - 1) * (der[i - 1] + der[i - 2]) % MOD;
    cout << der[n] << '\n';
}
```

:::

### Permutation Order


**题目大意**：先输入询问个数 `t`，随后每组询问给出类型 `type` 与 `n`（$n \le 20$）：`type = 1` 时再给出 `k`，输出 $1..n$ 的字典序第 `k` 个排列；`type = 2` 时再给出一个排列，输出它的字典序排名（从 1 开始）。`k` 与排名最大可达 $20! \approx 2.4 \times 10^{18}$，代码用 `ull` 存储。

**解题思路**：

- **观察**：阶乘进制。第 `i` 位的数字一经取定，剩余 $n-i$ 个数字就有 $(n-i)!$ 种排法，故第 `i` 位由商 $\lfloor k/(n-1-i)! \rfloor$ 决定（`fac[j] = j!`），余数继续决定后续各位。

- **做法**：求第 `k` 个排列时先把 `k` 减 1（让编号从 0 开始），从高位到低位依次令 `blk = fac[i]`、`idx = k / blk`、`k %= blk`，用 `set` 维护剩余数字并 `advance(it, idx)` 取出第 `idx` 小者，输出后 `erase`。求排名时从高位到低位统计剩余数字中比 `p[i]` 小的个数 `smaller`：以这些更小数字开头的排列全部排在 `p` 之前，共 `smaller * fac[n - 1 - i]` 个，累加后加 1 即得从 1 开始的排名。时间复杂度为 $O(n^2)$（`set` 的插入、删除与 `advance` 每轮合计 $O(n)$），空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
ull fac[21];
void solve() {
    fac[0] = 1;
    for (int i = 1; i <= 20; i++) fac[i] = fac[i - 1] * i;
    int t;
    cin >> t;
    while (t--) {
        int type, n;
        cin >> type >> n;
        set<int> s;
        for (int i = 1; i <= n; i++) s.insert(i);
        if (type == 1) {
            ull k;
            cin >> k;
            k--;
            for (int i = n - 1; i >= 0; i--) {
                ull blk = fac[i];
                int idx = k / blk;
                k %= blk;
                auto it = s.begin();
                advance(it, idx);
                cout << *it << ' ';
                s.erase(it);
            }
            cout << '\n';
        } else {
            vector<int> p(n);
            for (int i = 0; i < n; i++) cin >> p[i];
            ull rank = 0;
            for (int i = 0; i < n; i++) {
                int smaller = 0;
                for (int x : s)
                    if (x < p[i])
                        smaller++;
                rank += smaller * fac[n - 1 - i];
                s.erase(p[i]);
            }
            cout << rank + 1 << '\n';
        }
    }
}
```

:::

### Permutation Rounds


**题目大意**：给定排列 `p`（位置 `i` 的元素每轮移动到位置 `p[i]`），求经过多少轮数组第一次恢复有序，答案对 $10^9+7$ 取模。

**解题思路**：

- **观察**：把 `p` 看成映射 $i \mapsto p[i]$，从任一位置沿 `p` 一直走必然回到起点，从而走完一个循环（各位置被划分成若干互不相交的循环）；每轮每个循环整体转动一格，长 `len` 的循环要 `len` 轮才能让其中的元素回到原位。所有位置同时复原当且仅当轮数是所有循环长度的公倍数，故答案是所有循环长度的最小公倍数。

- **做法**：最小公倍数可能远超 `ll`，且不能在取模下直接求 lcm，故按质因数维护：用最小质因子筛 `spf` 分解每个循环长度，`mx[f]` 记录质数 `f` 在所有长度中出现的最大指数，答案 $= \prod_f f^{mx[f]} \bmod 10^9+7$（各质数取最大指数后相乘即为 lcm）。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve() {
    int n;
    cin >> n;
    vector<int> p(n + 1);
    for (int i = 1; i <= n; i++) cin >> p[i];
    vector<int> spf(n + 1);
    for (int i = 2; i <= n; i++)
        if (!spf[i])
            for (int j = i; j <= n; j += i)
                if (!spf[j])
                    spf[j] = i;
    vector<ll> mx(n + 1, 0);
    vector<bool> vis(n + 1);
    for (int i = 1; i <= n; i++)
        if (!vis[i]) {
            int len = 0, x = i;
            while (!vis[x]) {
                vis[x] = true;
                x = p[x];
                len++;
            }
            int y = len;
            while (y > 1) {
                int f = spf[y], c = 0;
                while (y % f == 0) {
                    y /= f;
                    c++;
                }
                mx[f] = max(mx[f], (ll)c);
            }
        }
    ll ans = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 0; j < mx[i]; j++) ans = ans * i % MOD;
    cout << ans << '\n';
}
```

:::

### Bracket Sequences I


**题目大意**：求长度为 `n` 的合法括号序列的数量，对 $10^9+7$ 取模（$n \le 10^6$）；`n` 为奇数时答案为 0。

**解题思路**：

- **观察**：合法序列要求 '(' 与 ')' 各 $n/2$ 个、且任意前缀中 '(' 不少于 ')'。只满足数量条件（各 $n/2$ 个）的序列共 $\binom{n}{n/2}$ 个；不合法者必在某个前缀处 ')' 多于 '('，把该前缀中的括号全部翻转（'(' 与 ')' 互换）后，得到的序列含 $n/2+1$ 个 '(' 与 $n/2-1$ 个 ')'，这个对应是一一的（反射原理），故不合法序列共 $\binom{n}{n/2+1}$ 个，答案为 $\binom{n}{n/2} - \binom{n}{n/2+1}$。

- **做法**：由 $\binom{n}{h+1} = \binom{n}{h} \cdot \frac{h}{h+1}$（$h = n/2$）可把上式化简为 $\frac{1}{h+1}\binom{n}{h}$，即第 $h$ 个卡特兰数，与代码 `C(n, h) * power(h + 1, MOD - 2) % MOD` 一致。代码预处理阶乘与逆元（阶乘上界 `N = 1000000`），`n` 为奇数时直接输出 0。时间复杂度为 $O(N)$，空间复杂度为 $O(N)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const int N = 1000000;
ll fac[N + 1], invfac[N + 1];
ll power(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
ll C(int n, int k) {
    if (k < 0 || k > n)
        return 0;
    return fac[n] * invfac[k] % MOD * invfac[n - k] % MOD;
}
void solve() {
    fac[0] = 1;
    for (int i = 1; i <= N; i++) fac[i] = fac[i - 1] * i % MOD;
    invfac[N] = power(fac[N], MOD - 2);
    for (int i = N; i >= 1; i--) invfac[i - 1] = invfac[i] * i % MOD;
    int n;
    cin >> n;
    if (n % 2) {
        cout << 0 << '\n';
        return;
    }
    int h = n / 2;
    ll ans = C(n, h) * power(h + 1, MOD - 2) % MOD;
    cout << ans << '\n';
}
```

:::

### Bracket Sequences II


**题目大意**：求长度为 `n` 的合法括号序列中，以给定字符串 `s` 为前缀的有多少个，对 $10^9+7$ 取模（$n \le 10^6$）。

**解题思路**：

- **观察**：设 `s` 中 '(' 有 `l` 个、')' 有 `r` 个，则剩余的 $rem = n - k$ 个位置（`k` 为 `s` 的长度）要填 $needL = n/2 - l$ 个 '(' 与 $needR = n/2 - r$ 个 ')'，且补全过程中平衡度不能降到 0 以下。满足数量条件的补全共 $\binom{rem}{needL}$ 个，其中越界者由反射原理（把首个使平衡度降到 $-1$ 的前缀整体翻转）与「$rem$ 个位置中含 $needR + 1$ 个 '('、$needL - 1$ 个 ')' 的序列」一一对应，数量为 $\binom{rem}{needR+1} = \binom{rem}{needL-1}$（由 $needL + needR = rem$ 得两个组合数相等），故答案为 $\binom{rem}{needL} - \binom{rem}{needL-1}$。

- **做法**：先验证前缀本身：扫描 `s` 累计 `l`、`r` 与平衡度 `d`（遇到 ')' 时 `d` 减 1，一旦 `d < 0` 就把 `ok` 置假）。`n` 为奇数、`l > n/2`、`r > n/2` 或 `!ok` 时答案为 0；`needL` 越出 $[0, rem]$ 时同样输出 0；否则输出 `(C(rem, needL) - C(rem, needL - 1) + MOD) % MOD`，其中 `C` 在 $k < 0$ 或 $k > n$ 时返回 0，故 `needL - 1` 为负也安全。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
const int MX = 1000005;
ll fac[MX], ifac[MX];
ll pw(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
ll C(int n, int k) {
    if (k < 0 || k > n)
        return 0;
    return fac[n] * ifac[k] % MOD * ifac[n - k] % MOD;
}
void solve() {
    int n;
    string s;
    cin >> n >> s;
    if (n % 2) {
        cout << 0 << '\n';
        return;
    }
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % MOD;
    ifac[n] = pw(fac[n], MOD - 2);
    for (int i = n; i >= 1; i--) ifac[i - 1] = ifac[i] * i % MOD;
    int k = (int)s.size(), l = 0, r = 0, d = 0;
    bool ok = true;
    for (char c : s) {
        if (c == '(') {
            l++;
            d++;
        } else {
            r++;
            d--;
            if (d < 0)
                ok = false;
        }
    }
    if (l > n / 2 || r > n / 2 || !ok) {
        cout << 0 << '\n';
        return;
    }
    int rem = n - k;
    int needL = n / 2 - l;
    if (needL < 0 || needL > rem) {
        cout << 0 << '\n';
        return;
    }
    ll ans = (C(rem, needL) - C(rem, needL - 1) + MOD) % MOD;
    cout << ans << '\n';
}
```

:::

### Counting Necklaces


**题目大意**：一条项链由 `n` 个珠子组成（$n \le 10^6$），每个珠子有 `m` 种颜色可选（$m \le 10^9$）。旋转后能重合的项链视为同一种，求不同项链的数量对 $10^9+7$ 取模的结果。

**解题思路**：

- **观察**：用 Burnside 引理数旋转下的等价类。旋转 `i` 格（$i = 0..n-1$）时，位置被分成 $\gcd(i, n)$ 个等长的轨道，同一轨道内的珠子颜色必须相同，故该旋转的不动点数为 $m^{\gcd(i,n)}$，不同项链数为 $\frac{1}{n}\sum_{i=0}^{n-1} m^{\gcd(i,n)}$。

- **做法**：按 $\gcd(i, n) = d$ 归并：$\gcd(i, n) = d$ 等价于 $i/d$ 与 $n/d$ 互质，这样的 `i` 在 $0..n-1$ 内恰有 $\varphi(n/d)$ 个，故答案 $= \frac{1}{n}\sum_{d \mid n} \varphi(n/d) \cdot m^{d}$。代码用埃氏筛法求 `phi[1..n]`（`iota` 初始化后，对每个质数 `i` 用 `phi[j] -= phi[j] / i` 更新它的倍数），再扫一遍 $1..n$ 找出 `n` 的全部因子，累加 `phi[n / i] * power(m % MOD, i)`，最后乘 `power(n, MOD - 2)` 完成除以 `n`。时间复杂度为 $O(n\log\log n + d(n)\log n)$（`d(n)` 为 `n` 的约数个数：除筛法外还要线性扫一遍找出因子、每个因子各做一次快速幂），空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
ll power(ll a, ll b)
{
    ll r = 1;
    while (b)
    {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
void solve()
{
    int n;
    ll m;
    cin >> n >> m;
    vector<int> phi(n + 1);
    iota(phi.begin(), phi.end(), 0);
    for (int i = 2; i <= n; i++)
        if (phi[i] == i)
            for (int j = i; j <= n; j += i) phi[j] -= phi[j] / i;
    ll ans = 0;
    for (int i = 1; i <= n; i++)
        if (n % i == 0)
        {
            ans = (ans + phi[n / i] % MOD * power(m % MOD, i)) % MOD;
        }
    ans = ans * power(n, MOD - 2) % MOD;
    cout << ans << '\n';
}
```

:::

### Counting Grids


**题目大意**：$n \times n$ 的网格，每格染黑或白（$n \le 10^9$）。旋转 $0^\circ$、$90^\circ$、$180^\circ$、$270^\circ$ 后能重合的染色视为同一种，求不同染色方案数对 $10^9+7$ 取模的结果。

**解题思路**：用 Burnside 引理对 4 种旋转分别数不动点：不旋转时 $n^2$ 个格子全自由，$2^{n^2}$ 个；旋转 $90^\circ$ 或 $270^\circ$ 时格子按 4 个一组循环（`n` 为奇数时中心 1 格自成一轨），轨道数 $\lceil n^2/4 \rceil$，各 $2^{\lceil n^2/4 \rceil}$ 个；旋转 $180^\circ$ 时格子按 2 个一组循环（`n` 为奇数时同样剩中心一格），$2^{\lceil n^2/2 \rceil}$ 个。故答案为 $\frac{1}{4}\left(2^{n^2} + 2 \cdot 2^{\lceil n^2/4 \rceil} + 2^{\lceil n^2/2 \rceil}\right)$，代码把三个指数分别取 `n2 % MOD2`、`(n2 + 3) / 4 % MOD2`、`(n2 + 1) / 2 % MOD2`（`MOD2 = MOD - 1`，$2$ 与 $p$ 互质，指数按费马小定理对 $p-1$ 取模），除以 4 换成乘 `power(4, MOD - 2)`；$n^2$ 可达 $10^{18}$，用 `ull` 计算防溢出。时间复杂度为 $O(\log n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
const ll MOD = 1e9 + 7;
const ll MOD2 = MOD - 1;
ll power(ll a, ll e) {
    ll r = 1;
    while (e) {
        if (e & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        e >>= 1;
    }
    return r;
}
void solve() {
    ll n;
    cin >> n;
    ull n2 = (ull)n * n;
    ll e0 = n2 % MOD2;
    ll e90 = ((n2 + 3) / 4) % MOD2;
    ll e180 = ((n2 + 1) / 2) % MOD2;
    ll ans = (power(2, e0) + 2 * power(2, e90) + power(2, e180)) % MOD;
    ans = ans * power(4, MOD - 2) % MOD;
    cout << ans << '\n';
}
```

:::

### Fibonacci Numbers


**题目大意**：求斐波那契数 $F_n \bmod 10^9+7$，其中 $F_0 = 0$、$F_1 = 1$，$n \le 10^{18}$。

**解题思路**：矩阵快速幂。转移矩阵 $T = \begin{bmatrix}1&1\\1&0\end{bmatrix}$ 满足 $T\begin{bmatrix}F_k\\F_{k-1}\end{bmatrix} = \begin{bmatrix}F_{k+1}\\F_k\end{bmatrix}$（第一行是 $F_k + F_{k-1} = F_{k+1}$，第二行是 $F_k$ 本身），反复应用即得 $T^n\begin{bmatrix}F_1\\F_0\end{bmatrix} = \begin{bmatrix}F_{n+1}\\F_n\end{bmatrix}$，故 $T^n$ 的第 0 行第 1 列就是 $F_n$。代码用二进制幂：`n` 为奇数时把当前的 `T` 乘进结果矩阵 `R`（初值为单位阵），随后 `T` 自乘、`n` 右移，循环结束时 `R` 即 $T^n$，输出 `R.a[0][1]`。每次矩阵乘法只有 8 次乘加，故时间复杂度为 $O(\log n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
struct Mat {
    ll a[2][2];
    Mat(bool id = false) {
        memset(a, 0, sizeof a);
        if (id)
            a[0][0] = a[1][1] = 1;
    }
};
Mat mul(Mat A, Mat B) {
    Mat C;
    for (int i = 0; i < 2; i++)
        for (int k = 0; k < 2; k++)
            if (A.a[i][k])
                for (int j = 0; j < 2; j++)
                    C.a[i][j] = (C.a[i][j] + A.a[i][k] * B.a[k][j]) % MOD;
    return C;
}
void solve() {
    ll n;
    cin >> n;
    Mat R(true), T;
    T.a[0][0] = T.a[0][1] = T.a[1][0] = 1;
    while (n) {
        if (n & 1)
            R = mul(R, T);
        T = mul(T, T);
        n >>= 1;
    }
    cout << R.a[0][1] % MOD << '\n';
}
```

:::

### Throwing Dice


**题目大意**：每次掷骰子得到 1 到 6 之间的一个点数，求点数之和恰为 `n` 的方案数对 $10^9+7$ 取模的结果（$n \le 10^{18}$）。

**解题思路**：设 $f(m)$ 为点数和恰为 $m$ 的方案数，按最后一次掷出的点数分类得 $f(m) = \sum_{v=1}^{6} f(m-v)$，初值 $f(1..6) = 1, 2, 4, 8, 16, 32$（$m \le 6$ 时没有「前面还有一次掷骰」的约束，方案数即 $2^{m-1}$，代码直接输出 `(1LL << (n - 1)) % MOD`）。用 $6 \times 6$ 矩阵加速：状态向量取 $(f(m-5), f(m-4), \ldots, f(m))$（最新项在末位），转移矩阵 `T` 中 `T[i][i + 1] = 1` 把窗口整体前移一格，`T[5][i] = 1` 令新的末位分量等于六个旧分量之和，于是 `T` 恰好把状态从 $m$ 推进到 $m+1$。以 `base = {1, 2, 4, 8, 16, 32}` 为 $m = 6$ 的初态，矩阵快速幂算出 $R = T^{n-6}$，答案取 $R \cdot base$ 的末位分量，代码写作 `R.a[5][i] * base[i]` 的累加。时间复杂度为 $O(6^3\log n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
struct Mat {
    ll a[6][6];
    Mat(bool id = false) {
        memset(a, 0, sizeof a);
        if (id)
            for (int i = 0; i < 6; i++) a[i][i] = 1;
    }
};
Mat mul(Mat A, Mat B) {
    Mat C;
    for (int i = 0; i < 6; i++)
        for (int k = 0; k < 6; k++)
            if (A.a[i][k])
                for (int j = 0; j < 6; j++)
                    C.a[i][j] = (C.a[i][j] + A.a[i][k] * B.a[k][j]) % MOD;
    return C;
}
void solve() {
    ll n;
    cin >> n;
    if (n <= 6) {
        cout << (1LL << (n - 1)) % MOD << '\n';
        return;
    }
    Mat R(true), T;
    for (int i = 0; i < 5; i++) T.a[i][i + 1] = 1;
    for (int i = 0; i < 6; i++) T.a[5][i] = 1;
    ll e = n - 6;
    while (e) {
        if (e & 1)
            R = mul(R, T);
        T = mul(T, T);
        e >>= 1;
    }
    ll base[6] = {1, 2, 4, 8, 16, 32};
    ll ans = 0;
    for (int i = 0; i < 6; i++) ans = (ans + R.a[5][i] * base[i]) % MOD;
    cout << ans << '\n';
}
```

:::

### Graph Paths I


**题目大意**：`n` 个点的有向图（$n \le 100$），可能有重边。求从点 1 到点 `n` 恰好经过 `k` 条边的路径数（$k \le 10^9$），对 $10^9+7$ 取模。

**解题思路**：邻接矩阵的幂。记 `A` 为邻接矩阵（`A[a][b]` 存 `a` 到 `b` 的边数），则 $(A^2)[i][j] = \sum_t A[i][t]A[t][j]$ 恰好枚举了「先一步到 `t`、再从 `t` 一步到 `j`」的全部中转点 `t`，即恰走 2 条边的路径数；对 `k` 归纳即得 $A^k[i][j]$ 是从 `i` 到 `j` 恰走 `k` 条边的路径数。用矩阵快速幂算出 $R = A^k$，输出 `R[0][n - 1]`（代码中 0 号点即点 1）。时间复杂度为 $O(n^3\log k)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
int n;
vector<vector<ll>> mul(vector<vector<ll>> A, vector<vector<ll>> B) {
    vector<vector<ll>> C(n, vector<ll>(n));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++)
            if (A[i][k])
                for (int j = 0; j < n; j++)
                    C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
    return C;
}
void solve() {
    int m;
    ll k;
    cin >> n >> m >> k;
    vector<vector<ll>> A(n, vector<ll>(n)), R(n, vector<ll>(n));
    for (int i = 0; i < n; i++) R[i][i] = 1;
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--, b--;
        A[a][b]++;
    }
    while (k) {
        if (k & 1)
            R = mul(R, A);
        A = mul(A, A);
        k >>= 1;
    }
    cout << R[0][n - 1] % MOD << '\n';
}
```

:::

### Graph Paths II


**题目大意**：带权有向图（$n \le 100$）与边数 `k`（$k \le 10^9$），求从点 1 到点 `n` 恰好经过 `k` 条边的最小总长度；不存在这样的路径时输出 -1。

**解题思路**：min-plus 矩阵乘法：把普通矩阵乘法的 $+$ 与 $\times$ 换成 $\min$ 与 $+$，即 $C[i][j] = \min_t (A[i][t] + B[t][j])$，它枚举了「先走 `a` 条边到 `t`、再走 `b` 条边到 `j`」的所有拼接并取最小总长，与最短路松弛同构；归纳即得 $A^k[i][j]$ 是从 `i` 到 `j` 恰走 `k` 条边的最小总长。实现上用 `INFLL` 表示不可达，乘法时跳过 `INFLL` 项以防相加溢出，重边只保留权值最小的那条；初值 `R` 取单位阵（`R[i][i] = 0`，表示恰走 0 条边），快速幂算出 $R = A^k$ 后，`R[0][n - 1] >= INFLL / 2` 时输出 -1。时间复杂度为 $O(n^3\log k)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
int n;
vector<vector<ll>> mul(vector<vector<ll>> A, vector<vector<ll>> B) {
    vector<vector<ll>> C(n, vector<ll>(n, INFLL));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++)
            if (A[i][k] < INFLL)
                for (int j = 0; j < n; j++)
                    if (B[k][j] < INFLL)
                        C[i][j] = min(C[i][j], A[i][k] + B[k][j]);
    return C;
}
void solve() {
    int m;
    ll k;
    cin >> n >> m >> k;
    vector<vector<ll>> A(n, vector<ll>(n, INFLL)), R(n, vector<ll>(n, INFLL));
    for (int i = 0; i < n; i++) R[i][i] = 0;
    for (int i = 0; i < m; i++) {
        int a, b;
        ll c;
        cin >> a >> b >> c;
        a--, b--;
        A[a][b] = min(A[a][b], c);
    }
    while (k) {
        if (k & 1)
            R = mul(R, A);
        A = mul(A, A);
        k >>= 1;
    }
    cout << (R[0][n - 1] >= INFLL / 2 ? -1 : R[0][n - 1]) << '\n';
}
```

:::

### System of Linear Equations


**题目大意**：求解 `n` 个方程、`m` 个未知数的线性方程组（系数与常数都小于 $10^9+7$），在模 $10^9+7$ 意义下输出任意一组解；无解时输出 -1。

**解题思路**：

- **做法**：模意义下的高斯消元。逐列选出主元：在当前行及以下找到第一个该列系数非零的行 `piv` 并交换到当前行，再把主元行乘 `pw(a[row][col], MOD - 2)` 归一化；由于模 $10^9+7$ 下非零元都可逆，归一化总是可行的。随后只消去主元下方的行（`a[i][j]` 减去 `a[i][col] * a[row][j]`），主元上方的行留给回代处理；`where[col]` 记录该列的主元行号，找不到主元的列（`where[col] == -1`）是自由变量。

- **边界**：自由变量一律取 0，再从最后一列向前回代出各主元变量：`x[col]` 等于该行常数项减去该行在 `col` 之后各列与已知变量的乘积之和。消元只处理了主元下方的行，得到的解必须代回**原始**方程（代码保存了一份 `orig`）逐一验证：若某个方程不成立，说明系数矩阵的秩小于增广矩阵的秩，方程组无解，输出 -1；验证通过则输出这组解。时间复杂度为 $O(n \cdot m \cdot \min(n, m))$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
ll pw(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
void solve() {
    int n, m;
    cin >> n >> m;
    vector<vector<ll>> a(n, vector<ll>(m + 1));
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= m; j++) cin >> a[i][j];
    vector<vector<ll>> orig = a;
    int row = 0;
    vector<int> where(m, -1);
    for (int col = 0; col < m && row < n; col++) {
        int piv = -1;
        for (int i = row; i < n; i++)
            if (a[i][col] != 0) {
                piv = i;
                break;
            }
        if (piv == -1)
            continue;
        swap(a[row], a[piv]);
        ll inv = pw(a[row][col], MOD - 2);
        for (int j = col; j <= m; j++) a[row][j] = a[row][j] * inv % MOD;
        for (int i = row + 1; i < n; i++) {
            if (a[i][col] != 0) {
                ll f = a[i][col];
                for (int j = col; j <= m; j++)
                    a[i][j] = (a[i][j] - f * a[row][j] % MOD + MOD) % MOD;
            }
        }
        where[col] = row;
        row++;
    }
    vector<ll> x(m, 0);
    for (int col = m - 1; col >= 0; col--) {
        if (where[col] == -1) {
            x[col] = 0;
            continue;
        }
        ll s = a[where[col]][m];
        for (int j = col + 1; j < m; j++)
            s = (s - a[where[col]][j] * x[j] % MOD + MOD) % MOD;
        x[col] = s;
    }
    for (int i = 0; i < n; i++) {
        ll s = 0;
        for (int j = 0; j < m; j++) s = (s + orig[i][j] * x[j]) % MOD;
        if (s != orig[i][m]) {
            cout << -1 << '\n';
            return;
        }
    }
    for (int j = 0; j < m; j++) cout << x[j] << ' ';
    cout << '\n';
}
```

:::

### Sum of Four Squares


**题目大意**：`t` 次询问，每次给一个非负整数 `n`（$n \le 10^7$），把它表示成四个非负整数的平方之和，输出任意一组（四平方和定理保证解一定存在）。

**解题思路**：把「四平方」拆成「两平方 + 两平方」。先预处理 `two[v]`：枚举 $a \le b$ 且 $a^2 + b^2 \le$ `MAXN`，为每个 $v = a^2 + b^2$ 保存最先遇到的一组 `(a, b)`（初始置 `{-1, -1}` 表示尚无表示）。每次询问枚举前两个数 `a`、`b`（同样限定 $a \le b$ 且 $a^2 + b^2 \le n$），令 `r = n - a * a - b * b`，一旦 `two[r]` 已有表示就输出 `a`、`b` 与 `two[r]` 的两分量。循环必然命中：把 `n` 的某个四平方表示中的四个数升序排列后取最小的两个作为 `a`、`b`，则 `r` 恰为另外两个数的平方和，故 `two[r]` 必有表示。预处理时间复杂度为 $O(MAXN)$，每次询问的时间复杂度为 $O(n)$，空间复杂度为 $O(MAXN)$。

:::details[题解(C++)]

```c++
const int MAXN = 10000000;
vector<pair<int, int>> two(MAXN + 1, {-1, -1});
void solve() {
    for (int a = 0; a * a <= MAXN; a++)
        for (int b = a; a * a + b * b <= MAXN; b++) {
            int v = a * a + b * b;
            if (two[v].first == -1)
                two[v] = {a, b};
        }
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        bool found = false;
        for (int a = 0; a * a <= n && !found; a++)
            for (int b = a; a * a + b * b <= n; b++) {
                int r = n - a * a - b * b;
                if (two[r].first != -1) {
                    cout << a << ' ' << b << ' ' << two[r].first << ' '
                         << two[r].second << '\n';
                    found = true;
                    break;
                }
            }
    }
}
```

:::

### Triangle Number Sums


**题目大意**：`t` 次询问，把正整数 `n`（$n \le 10^{18}$）表示为若干个三角数（$T_k = 1 + 2 + \cdots + k$）之和，求最少需要的三角数个数。

**解题思路**：

- **观察**：Gauss 定理：每个非负整数都能表示成不超过 3 个三角数之和，故答案只需在 1、2、3 中判定。

- **做法**：判 1：$n$ 是三角数当且仅当存在 `k` 使 $8n+1 = (2k+1)^2$，即 $8n+1$ 为完全平方数（`isSq` 用 `sqrt` 求出 $r$ 后把 $r$ 与 $r+1$ 都验证一遍，以消除浮点误差）。判 2：$n = T_a + T_b$ 等价于 $8n+2 = (2a+1)^2 + (2b+1)^2$，由两平方和定理，$8n+2$ 能写成两个平方数之和当且仅当它每个 $4k+3$ 型质因子的指数都是偶数；代码对 `tmp = 8 * n + 2` 试除分解，遇到 $p \equiv 3 \pmod 4$ 且指数为奇数时就判为不能，分解后剩下的大于 1 的质数若也 $\equiv 3 \pmod 4$（指数为 1）同样判为不能；能则输出 2。两者都不成立则输出 3。每组询问的时间复杂度为 $O(\sqrt{n})$（对 $8n+2$ 试除分解质因数），空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
bool isSq(ll n) {
    ll r = sqrt((long double)n);
    return r * r == n || (r + 1) * (r + 1) == n;
}
void solve() {
    int t;
    cin >> t;
    while (t--) {
        ll n;
        cin >> n;
        if (isSq(8 * n + 1)) {
            cout << 1 << '\n';
            continue;
        }
        ll tmp = 8 * n + 2;
        bool two = true;
        for (ll p = 2; p * p <= tmp; p++) {
            if (tmp % p == 0) {
                int e = 0;
                while (tmp % p == 0) {
                    tmp /= p;
                    e++;
                }
                if (p % 4 == 3 && e % 2 == 1)
                    two = false;
            }
        }
        if (tmp > 1 && tmp % 4 == 3)
            two = false;
        cout << (two ? 2 : 3) << '\n';
    }
}
```

:::

### Dice Probability


**题目大意**：掷 `n` 次骰子（$n \le 100$），每次得到 1 到 6 之间的一个点数，求点数之和落在区间 $[a, b]$ 内的概率，保留 6 位小数。

**解题思路**：概率 DP。设 `dp[i][s]` 为掷 `i` 次后点数和为 `s` 的概率（第二维开到 `6 * n + 1`），初值 `dp[0][0] = 1`；转移时枚举第 `i` 次掷出的点数 `d`（$1 \le d \le 6$，要求 `s >= d`），把 `dp[i - 1][s - d]` 以 $1/6$ 的概率分摊进来，即 `dp[i][s] += dp[i - 1][s - d] / 6.0`。填完表后答案就是 $\sum_{s=a}^{b} dp[n][s]$；累加过程用 `long double` 以减小误差，输出时转 `double` 并保留 6 位小数。时间复杂度为 $O(6n^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, a, b;
    cin >> n >> a >> b;
    vector<vector<long double>> dp(n + 1, vector<long double>(6 * n + 1));
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++)
        for (int s = 1; s <= 6 * i; s++)
            for (int d = 1; d <= 6; d++)
                if (s >= d)
                    dp[i][s] += dp[i - 1][s - d] / 6.0;
    long double ans = 0;
    for (int s = a; s <= b; s++) ans += dp[n][s];
    cout << fixed << setprecision(6) << (double)ans << '\n';
}
```

:::

### Moving Robots


**题目大意**：$8 \times 8$ 棋盘上每个格子各有一个机器人。每个机器人独立地随机走 `k` 步（$k \le 1000$），每步等概率地走向一个不越界的相邻格。求走完后空格子数的期望。

**解题思路**：由期望线性性，期望空格数 $= \sum_c P(\text{格子 } c \text{ 为空})$。各机器人移动相互独立，故 $P(\text{格子 } c \text{ 为空}) = \prod_s \left(1 - P(\text{起点 } s \text{ 的机器人走到 } c)\right)$。对每个起点 `s` 单独做 `k` 步 DP 得到分布 `start[s]`：初值 `cur[s] = 1`，每步先数出当前格合法的方向数 `ways`，再把 `cur[c]` 均分给各相邻格，即 `nxt[nr * 8 + nc] += cur[c] / ways`；`k` 步后把 `cur` 存入 `start[s]`。最后对每个格子 `c` 求上述乘积并累加。时间复杂度为 $O(64 \cdot k \cdot 64)$，空间复杂度为 $O(64^2)$。

:::details[题解(C++)]

```c++
void solve() {
    int k;
    cin >> k;
    vector<vector<double>> start(64);
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    for (int s = 0; s < 64; s++) {
        vector<double> cur(64, 0);
        cur[s] = 1;
        for (int step = 0; step < k; step++) {
            vector<double> nxt(64, 0);
            for (int c = 0; c < 64; c++)
                if (cur[c] > 0) {
                    int r = c / 8, col = c % 8;
                    int ways = 0;
                    for (int d = 0; d < 4; d++) {
                        int nr = r + dx[d], nc = col + dy[d];
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8)
                            ways++;
                    }
                    for (int d = 0; d < 4; d++) {
                        int nr = r + dx[d], nc = col + dy[d];
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8)
                            nxt[nr * 8 + nc] += cur[c] / ways;
                    }
                }
            cur = nxt;
        }
        start[s] = cur;
    }
    double ans = 0;
    for (int c = 0; c < 64; c++) {
        double p = 1;
        for (int s = 0; s < 64; s++) p *= (1 - start[s][c]);
        ans += p;
    }
    cout << fixed << setprecision(6) << ans << '\n';
}
```

:::

### Candy Lottery


**题目大意**：`n` 个孩子各自独立地获得一个 1 到 `k` 之间的均匀随机整数（$n \le 100$，$k \le 10^6$），求最大值的期望，精确到 6 位小数。

**解题思路**：

- **观察**：对取非负整数值的随机变量有 $E[X] = \sum_{m \ge 1} P(X \ge m)$，故最大值的期望为 $\sum_{m=1}^{k}\left(1 - P(\text{所有孩子的取值都小于 } m)\right) = \sum_{m=1}^{k}\left(1 - \left(\frac{m-1}{k}\right)^n\right)$，其中各孩子独立、取值都小于 `m` 的概率是 $\left(\frac{m-1}{k}\right)^n$。

- **边界**：输出要求精确到 6 位小数，直接 `printf` 可能因浮点误差在第 6 位出错，故代码把答案放大 $10^6$ 倍后按整数处理：小数部分超过 0.5 就进 1，恰为 0.5 时按末位为偶数（四舍六入五成双）决定是否进位，最后把整数部分与小数部分分段输出。时间复杂度为 $O(nk)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    long double ans = 0;
    for (int m = 1; m <= k; m++) {
        long double p = (long double)(m - 1) / k;
        long double pw = 1;
        for (int i = 0; i < n; i++) pw *= p;
        ans += 1.0L - pw;
    }

    long double v = ans * 1e6L;
    ll ip = (ll)floorl(v + 1e-9L);
    long double frac = v - ip;
    if (frac > 0.5L + 1e-12L)
        ip++;
    else if (fabsl(frac - 0.5L) <= 1e-12L && ip % 2 == 1)
        ip++;
    printf("%lld.%06lld\n", ip / 1000000, ip % 1000000);
}
```

:::

### Inversion Probability


**题目大意**：`n` 个数（$n \le 100$），第 `i` 个数在 $[1, r_i]$（$r_i \le 100$）内均匀随机取值，各数独立。求逆序对数的期望，精确到 6 位小数。

**解题思路**：

- **观察**：由期望线性性，总期望等于每一对贡献之和：$E = \sum_{a<b} P(x_a > x_b)$。对固定的一对 `(a, b)`，令 `lim = min(r[a], r[b])`：当 $x_b \le lim$ 时 $x_a$ 有 $r[a] - x_b$ 种取值大于 $x_b$，故有利取值数为 `cnt` $= \sum_{x_b=1}^{lim}(r[a] - x_b) = lim \cdot r[a] - \frac{lim(lim+1)}{2}$，该对的贡献为概率 `cnt / (r[a] * r[b])`。

- **做法**：为避免浮点误差，全部 $\binom{n}{2}$ 个分数用精确有理数累加：分子 `num`、分母 `den`，把每项 `val / d`（`val = cnt * 1000000`）拆成整数商与余数 `m = val % d`——整数商累加进 `W`，余数按 `num = num * d + m * den`、`den *= d` 通分并入。分母只由各个 $d = r_a r_b$（$r_a, r_b \le 100$）相乘而来，故它的素因子都不超过 97，用 $\{2, 3, \ldots, 97\}$ 内的小质数逐个约分即可。为此实现了 320 位大整数 `Big`（5 个 `ull` 位段，支持加减、乘小整数、除小整数与二进制长除）。最后对 `num / den` 做长除得到商与余数，按四舍六入五成双输出 6 位小数。总时间复杂度为 $O(n^2)$ 次有理数运算，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
typedef __uint128_t u128;

struct Big {
    ull a[5];
    Big() { memset(a, 0, sizeof a); }
    Big(ull x) {
        memset(a, 0, sizeof a);
        a[0] = x;
    }
    bool isZero() const {
        for (int i = 0; i < 5; i++)
            if (a[i])
                return false;
        return true;
    }
    void mulSmall(ull x) {
        ull carry = 0;
        for (int i = 0; i < 5; i++) {
            u128 t = (u128)a[i] * x + carry;
            a[i] = (ull)t;
            carry = (ull)(t >> 64);
        }
    }
    void add(const Big& o) {
        ull carry = 0;
        for (int i = 0; i < 5; i++) {
            ull s = a[i] + o.a[i] + carry;
            carry = (s < a[i] || (carry && s == a[i])) ? 1 : 0;
            a[i] = s;
        }
    }
    void sub(const Big& o) {
        ull borrow = 0;
        for (int i = 0; i < 5; i++) {
            ull s = o.a[i] + borrow;
            bool b = a[i] < s;
            a[i] -= s;
            borrow = b ? 1 : 0;
        }
    }
    ull modSmall(ull x) const {
        ull r = 0;
        for (int i = 4; i >= 0; i--) r = (ull)(((u128)r << 64 | a[i]) % x);
        return r;
    }
    void divSmall(ull x) {
        ull rem = 0;
        for (int i = 4; i >= 0; i--) {
            u128 cur = ((u128)rem << 64) | a[i];
            a[i] = (ull)(cur / x);
            rem = (ull)(cur % x);
        }
    }
    int cmp(const Big& o) const {
        for (int i = 4; i >= 0; i--) {
            if (a[i] != o.a[i])
                return a[i] < o.a[i] ? -1 : 1;
        }
        return 0;
    }
    void divmod(const Big& den, Big& qout, Big& rout) const {
        qout = Big();
        rout = Big();
        for (int bit = 319; bit >= 0; bit--) {
            ull carry = 0;
            for (int i = 0; i < 5; i++) {
                ull t = (rout.a[i] << 1) | carry;
                carry = rout.a[i] >> 63;
                rout.a[i] = t;
            }
            rout.a[0] |= (a[bit >> 6] >> (bit & 63)) & 1ULL;
            if (rout.cmp(den) >= 0) {
                rout.sub(den);
                qout.a[bit >> 6] |= 1ULL << (bit & 63);
            }
        }
    }
};

void solve() {
    int n;
    cin >> n;
    vector<ll> r(n);
    for (auto& v : r) cin >> v;
    int primes[] = {2,  3,  5,  7,  11, 13, 17, 19, 23, 29, 31, 37, 41,
                    43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97};
    Big num(0), den(1);
    ll W = 0;
    for (int a = 0; a < n; a++)
        for (int b = a + 1; b < n; b++) {
            ll ra = r[a], rb = r[b];
            ll lim = min(ra, rb);
            ll cnt = lim * ra - lim * (lim + 1) / 2;
            ll val = cnt * 1000000LL;
            ll d = ra * rb;
            W += val / d;
            ll m = val % d;
            if (m == 0)
                continue;

            Big numNew = num;
            numNew.mulSmall(d);
            Big t = den;
            t.mulSmall(m);
            numNew.add(t);
            Big denNew = den;
            denNew.mulSmall(d);
            if (!numNew.isZero()) {
                for (int p : primes) {
                    if (denNew.modSmall(p) != 0)
                        continue;
                    Big tmp = denNew;
                    int vpDen = 0;
                    while (tmp.modSmall(p) == 0) {
                        tmp.divSmall(p);
                        vpDen++;
                    }
                    int vpNum = 0;
                    while (numNew.modSmall(p) == 0) {
                        numNew.divSmall(p);
                        vpNum++;
                    }
                    int delta = min(vpNum, vpDen);
                    for (int i = 0; i < delta; i++) denNew.divSmall(p);
                    for (int i = delta; i < vpNum; i++) numNew.mulSmall(p);
                }
            }
            num = numNew;
            den = denNew;
        }
    Big Q, R;
    num.divmod(den, Q, R);
    ll total = W + (ll)Q.a[0];
    Big diff = den;
    diff.sub(R);
    int cr = R.cmp(diff);
    if (cr > 0)
        total++;
    else if (cr == 0 && (total & 1))
        total++;
    printf("%lld.%06lld\n", total / 1000000, total % 1000000);
}
```

:::

### Stick Game


**题目大意**：一堆 `n` 根石子（$n \le 10^6$），每次可以取走数量集合 `p` 中的任意一种（$|p| \le 100$），取走最后一根者胜。对每个石子数 $1..n$ 判断先手是否必胜，输出长度为 `n` 的 `W`/`L` 序列（`W` 表示该局面先手必胜）。

**解题思路**：设 `win[i]` 表示剩 `i` 根石子时先手是否必胜。`i` 根的局面可以取走 `p` 中的某个 `x`（要求 `i >= x`），取完后对手面对 `i - x` 根；只要存在一个 `x` 使 `win[i - x]` 为假，即把必败态交给对手，先手就必胜，代码找到第一个这样的 `x` 后立即 `break`。`win[0] = false` 是无子可取者的必败态，按 `i` 从小到大递推即可覆盖全部转移。时间复杂度为 $O(nk)$（`k` 为 `p` 的大小），空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<int> p(k);
    for (int i = 0; i < k; i++) cin >> p[i];
    vector<bool> win(n + 1);
    for (int i = 1; i <= n; i++)
        for (int x : p)
            if (i >= x && !win[i - x]) {
                win[i] = true;
                break;
            }
    for (int i = 1; i <= n; i++) cout << (win[i] ? 'W' : 'L');
    cout << '\n';
}
```

:::

### Nim Game I


**题目大意**：`t` 组测试，每组 `n` 堆石子，每次可以任选一堆取走任意正数颗，取走最后一颗者胜，判断先手胜负（先手必胜输出 `first`，否则输出 `second`）。

**解题思路**：Nim 结论：先手必胜当且仅当所有堆石子数的异或和 `xo` 不为 0。异或和为 0 时，任意一步只让某一堆变小、其余堆不变，新异或和必定非 0，即 0 只能转移到非 0；而异或和非 0 时，取 `xo` 的最高位 1，找到该位为 1 的那一堆 $x$（必有这样的堆），把它取成 $x \oplus xo < x$，新异或和就回到 0。故异或和 0 是必败态、非 0 是必胜态，且每次操作都使石子总数减少，结论自洽。每组的时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    int xo = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        xo ^= x;
    }
    cout << (xo ? "first" : "second") << '\n';
}
```

:::

### Nim Game II


**题目大意**：`t` 组测试，每组 `n` 堆石子，每次可以任选一堆取走 1 到 3 颗，取走最后一颗者胜，判断先手胜负（先手必胜输出 `first`，否则输出 `second`）。

**解题思路**：由 SG 定理，多堆游戏的总 SG 值为各堆 SG 值的异或和，总 SG 为 0 时必败、非 0 时必胜。单堆还剩 `x` 颗时能一步到达 $x-1, x-2, x-3$，它们的 SG 值恰是除 $x \bmod 4$ 之外的三个余数，故 $\operatorname{SG}(x) = x \bmod 4$。代码把每堆的 `x % 4` 异或起来，结果为非 0 输出 `first`。每组的时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    int xo = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        xo ^= (x % 4);
    }
    cout << (xo ? "first" : "second") << '\n';
}
```

:::

### Stair Game


**题目大意**：`t` 组测试。有 `n` 级楼梯，编号 $1..n$，每级楼梯上最初有若干球。每次选一个编号不为 1 且至少有一个球的楼梯 `k`，把任意正数个球从 `k` 级移到 $k-1$ 级。移动最后一个球者胜，判断先手胜负（先手必胜输出 `first`，否则输出 `second`）。

**解题思路**：

- **观察**：只有偶数级楼梯上的球数影响胜负。把球从第 `k` 级移到第 `k-1` 级会让所在级的奇偶性互换：从偶数级往奇数级移，相当于 Nim 中「从某一堆取走若干」（这一堆就是该偶数级）；而从奇数级往偶数级移，只是往某个偶数级里塞球，对手可以立刻把同样多的球从该偶数级再往下移一格（回到奇数级）来抵消，偶数级的异或和不受影响。

- **正确性**：奇数级上的球只能在相邻偶数级之间往返，对胜负没有实质贡献；故局面等价于把每个偶数级看作一堆、每堆球数取该级球数的 Nim 游戏，必胜判据即这些球数的异或和非 0（Nim 结论）。每组的时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    ll xr = 0;
    for (int i = 1; i <= n; i++) {
        ll p;
        cin >> p;
        if (i % 2 == 0)
            xr ^= p;
    }
    cout << (xr ? "first" : "second") << '\n';
}
```

:::

### Grundy's Game


**题目大意**：`t` 次询问（$n \le 10^6$）。一堆 `n` 个硬币，每次把任意一堆分成两堆**数量不同**的非空堆，无法操作者负，判断先手胜负（先手必胜输出 `first`，否则输出 `second`）。

**解题思路**：

- **观察**：把一堆拆成 `a` 与 `n - a` 两堆后，局面变成两个互相独立的子游戏，SG 值取异或，故 $g[n] = \operatorname{mex}\{g[a] \oplus g[n-a] : 1 \le a < n-a\}$（枚举 $a < n - a$ 即可覆盖所有无序拆分，且这样枚举出的两堆数量一定不同）。

- **做法**：SG 值都很小，用长度 512 的 `seen` 数组标记每种拆分对应的 $g[a] \oplus g[n-a]$，再取最小未出现的值作为 $g[n]$。预计算到 `MX = 2000`：Grundy 游戏的必败态（$g[n] = 0$）只有有限多个，最大者小于 2000，故 $n \ge MX$ 时直接输出 `first`。预处理时间复杂度为 $O(MX^2)$，每次询问的时间复杂度为 $O(1)$，空间复杂度为 $O(MX)$。

:::details[题解(C++)]

```c++
const int MX = 2000;
int g[MX + 1];
void solve() {
    for (int n = 3; n < MX; n++) {
        bool seen[512] = {};
        for (int i = 1; i * 2 < n; i++) seen[g[i] ^ g[n - i]] = true;
        int mex = 0;
        while (seen[mex]) mex++;
        g[n] = mex;
    }
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        if (n >= MX)
            cout << "first\n";
        else
            cout << (g[n] ? "first" : "second") << '\n';
    }
}
```

:::

### Another Game


**题目大意**：`t` 组测试，每组 `n` 堆硬币，每次选择若干非空堆并从选中的每堆各取走 1 枚，取走最后一枚硬币者胜，判断先手胜负（先手必胜输出 `first`，否则输出 `second`）。

**解题思路**：

- **观察**：所有堆都是偶数的局面是必败态。先手任取若干堆各取 1 枚后，被选中的堆（按定义非空，故原本至少是 2）全部变成奇数，后手只需把这些奇数堆也各取 1 枚，局面就恢复为全偶；反过来，只要存在奇数堆，先手把所有奇数堆各取 1 枚即可一步把局面变成全偶。故判据是「是否存在奇数堆」。

- **正确性**：全偶时后手的应答总是合法（奇数堆至少有 1 枚可被取走），且每次应答后局面仍为全偶，而硬币总数严格减少，过程不可能无限延续；终止时轮到走子的一方面对的是各堆皆空的全偶局面、无子可取，故全偶必败、含奇数堆必胜。每组的时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve() {
    int n;
    cin >> n;
    bool odd = false;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x & 1)
            odd = true;
    }
    cout << (odd ? "first" : "second") << '\n';
}
```

:::

## Counting Problems

### Filled Subgrid Count I


**题目大意**：给定 `n`、`k`（$n \le 3000$）与一个 $n\times n$ 的字母网格，对字母表前 `k` 个字母逐一统计「完全由该字母组成的正方形子网格」的个数。输出 `k` 行，第 `c` 行为第 `c` 个字母（从 `A` 起）的答案。

**解题思路**：逐字母独立处理。固定字母 `c` 时，`dp[i][j]` 表示以 `(i,j)` 为右下角的全 `c` 正方形最大边长：`g[i][j] - 'A' != c` 时置 0，否则取正上 `dp[i-1][j]`、正左 `dp[i][j-1]`、左上 `dp[i-1][j-1]` 三者的最小值加 1——向上与向左的延伸分别受正上、正左两格限制，两者共同决定边长上限。以 `(i,j)` 为右下角的全 `c` 正方形恰好有 `dp[i][j]` 个（边长 $1,\dots,dp[i][j]$ 各一个），全部累加即为该字母的答案。时间复杂度为 $O(kn^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int c = 0; c < k; c++)
    {
        ll cur = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
            {
                if (g[i][j] - 'A' != c)
                {
                    dp[i][j] = 0;
                    continue;
                }
                int v = 1;
                if (i > 0 && j > 0)
                {
                    int a = dp[i - 1][j], b = dp[i][j - 1], d = dp[i - 1][j - 1];
                    int m = a < b ? a : b;
                    if (d < m) m = d;
                    v = m + 1;
                }
                dp[i][j] = v;
                cur += v;
            }
        cout << cur << '\n';
    }
}
```

:::

### Filled Subgrid Count II


**题目大意**：给定 `n`、`k`（$n \le 3000$）与一个 $n\times n$ 的字母网格，对字母表前 `k` 个字母逐一统计「完全由该字母组成的矩形子网格」的个数。输出 `k` 行，第 `c` 行为第 `c` 个字母（从 `A` 起）的答案。

**解题思路**：

- **观察**：矩形由底边所在行与左右端列唯一确定，故逐行枚举行 `r` 作底边，用 `height[c]` 记录列 `c` 从 `r` 向上连续同字母的高度（`g[r][c] == g[r-1][c]` 时在上一行的高度上加 1，否则为 1）。第 `r` 行的字母被若干极大同字母连续段划分，只有左右端落在同一段内的矩形才可能整块同字母；固定底边与段后，左右端 $c_1 \le c_2$ 之间能构成全 `L` 矩形当且仅当矩形高度不超过 $\min_{c_1 \le c \le c_2} height[c]$，因此该段的矩形总数恰为 `height` 在段上所有子数组的最小值之和，每个矩形只被自己的底边与列区间统计一次。

- **做法**：对每个段用单调栈（弹栈条件为严格大于，故栈内高度自底向上不降）求子数组最小值之和：扫到位置 `c` 时弹出栈顶所有高度大于 `height[c]` 的下标，被弹出的 `mid` 作为一个极大区间的最小值代表——若 `prev` 为弹出后的栈顶下标（栈空时取 `left-1`），则左端可取 `prev+1 .. mid`、右端可取 `mid .. c-1`，贡献 `height[mid] * (mid - prev) * (c - mid)`，累加进 `ans[g[r][left] - 'A']`；段末用哨兵 `cur = 0` 触发全部弹出。

- **正确性**：等高时按下标先后归属，段内每个子数组恰由它最左侧的最小值下标统计一次；跨段的矩形底边含两种字母，必然不满足条件。总时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    vector<int> height(n, 0), st(n);
    vector<ll> ans(k, 0);
    for (int r = 0; r < n; r++)
    {
        for (int c = 0; c < n; c++)
            height[c] = (r && g[r][c] == g[r - 1][c]) ? height[c] + 1 : 1;

        for (int left = 0; left < n;)
        {
            int right = left + 1;
            while (right < n && g[r][right] == g[r][left]) right++;

            int top = 0;
            for (int c = left; c <= right; c++)
            {
                int cur = (c == right ? 0 : height[c]);
                while (top && height[st[top - 1]] > cur)
                {
                    int mid = st[--top];
                    int prev = top ? st[top - 1] : left - 1;
                    ans[g[r][left] - 'A'] +=
                        1LL * height[mid] * (mid - prev) * (c - mid);
                }
                if (c < right) st[top++] = c;
            }
            left = right;
        }
    }
    for (int c = 0; c < k; c++) cout << ans[c] << '\n';
}
```

:::

### All Letter Subgrid Count I


**题目大意**：给定 `n`、`k`（$n \le 3000$）与一个 $n\times n$ 网格，格子上的字母取自字母表前 `k` 种字母。统计「包含全部 `k` 种字母的正方形子网格」的个数，输出一个整数（不取模）。

**解题思路**：

- **观察**：以 `(i,j)` 为左上角、边长为 $d$ 的正方形覆盖到的格子恰是满足 $\max(x-i,\,y-j) \le d-1$ 的格子，所以只需求出从 `(i,j)` 到每种字母最近格子的距离，取其中最大者加 1 即为覆盖全部字母所需的最小边长。

- **做法**：`need[i*n+j]` 存这个「最小边长减 1」。对每种字母 `c` 从右下角倒推：`cur[j]` 为从 `(i,j)` 出发到右下方区域内最近 `c` 格的距离，`(i,j)` 本身是 `c` 时为 0，否则为 `min(below[j], cur[j+1], below[j+1]) + 1`（`below` 存下一行的 `cur`，每行用 `swap(below, cur)` 滚动；`cur[n]` 与初始 `below` 置哨兵 `BIG = n + 1`）。`need` 在所有字母上取最大值。最后对每个左上角逐项判断：合法边长为 `side = need[i*n+j] + 1` 到 `mx = min(n-i, n-j)`，共 `mx - side + 1` 个，`side > mx` 时不贡献。

- **正确性**：边长 $d$ 的正方形包含字母 `c` 当且仅当 $d-1$ 不小于到最近 `c` 格的距离，故 `side` 正是包含全部字母的最小边长，更大的边长只增不减地包含原格子；每个正方形由唯一的左上角统计一次。右下方不存在某字母时，距离由 `BIG` 逐层加 1 得到、必大于 `n`，而 $mx \le n$，该左上角自然不贡献。总时间复杂度为 $O(kn^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    const int BIG = n + 1;
    vector<int> need(n * n, 0), below(n + 1), cur(n + 1);
    for (int c = 0; c < k; c++)
    {
        fill(below.begin(), below.end(), BIG);
        for (int i = n - 1; i >= 0; i--)
        {
            cur[n] = BIG;
            for (int j = n - 1; j >= 0; j--)
            {
                if (g[i][j] - 'A' == c)
                    cur[j] = 0;
                else
                    cur[j] = min({below[j], cur[j + 1], below[j + 1]}) + 1;
                need[i * n + j] = max(need[i * n + j], cur[j]);
            }
            swap(below, cur);
        }
    }
    ll ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
        {
            int side = need[i * n + j] + 1;
            int mx = min(n - i, n - j);
            if (side <= mx) ans += mx - side + 1;
        }
    cout << ans << '\n';
}
```

:::

### All Letter Subgrid Count II


**题目大意**：给定 `n`、`k`（`n` 可达 3000、`k` 可达 26）与一个 $n\times n$ 网格，格子上的字母取自字母表前 `k` 种字母。统计「包含全部 `k` 种字母的矩形子网格」的个数，输出一个整数（不取模）。

**解题思路**：按 $2^k$ 与 `n` 的大小关系选两种算法，代码以 `k < 31 && (1U << k) <= (unsigned)n` 为分界。

- **做法（$2^k \le n$，容斥）**：对每个字母子集 `allowed` 统计「只使用 `allowed` 中字母」的矩形数 `cur`——枚举底边行 `r`，`height[c]` 为列 `c` 向上连续满足 `cell[r*n+c] & ~allowed == 0` 的高度（不满足的格子高度为 0，自动把直方图切断、使含它的矩形贡献为 0），再用单调栈求整行子数组最小值之和。再按 $(-1)^{k-|allowed|}$ 累加（代码用 `__builtin_popcount(allowed) ^ k` 的奇偶决定加减）：字母集合为 $S$ 的矩形在求和中的系数是 $\sum_{S \subseteq T \subseteq [k]} (-1)^{k-|T|}$，当且仅当 $S$ 为全部字母时等于 1、其余情形正负相消为 0。

- **做法（`k` 较大，枚举行对 + 位运算）**：枚举行对 `(r1, r2)`，`r2` 递增时把第 `r2` 行的格子掩码并入 `colMask[j]`，并求行对覆盖的字母并集 `rowOr`，不含全部字母则跳过。随后从左到右扫列，用 `gap[L]` 记录字母 `L` 最近一次出现到当前列的列距（当前列不含 `L` 时在原值上加 1、含 `L` 时清零）；当前列 `c` 的 $mx=\max_L gap[L]$ 就是「使 $[l,c]$ 覆盖全部字母」所允许的最大左端偏移，合法的左端点恰为 $0..c-mx$，贡献 `c - mx + 1`。`gap` 用 8 路 SSE2 并行维护（每 8 个字母压进一组 int16 通道），`mx` 用多级 shuffle 求水平最大值，常数大幅缩小。

- **正确性**：容斥按矩形实际使用的字母集合精确计数；枚举法固定上下边后，每个覆盖全部字母的矩形由自己的右端 `c` 唯一确定，贡献数 `c - mx + 1` 恰是它可取的左端个数。两种情形的时间复杂度为 $O(2^k n^2)$ 与 $O(n^3)$（每对行都要 $O(n)$ 并入掩码，通过检查的还要 $O(n)$ 扫列，列内 SIMD 部分为常数因子），空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
#include <emmintrin.h>

void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    vector<unsigned int> cell(n * n), rowMask(n, 0);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
        {
            cell[i * n + j] = 1U << (g[i][j] - 'A');
            rowMask[i] |= cell[i * n + j];
        }

    if (k < 31 && (1U << k) <= static_cast<unsigned>(n))
    {
        ll ans = 0;
        vector<int> height(n), st(n);
        const unsigned int full = (1U << k) - 1;
        for (unsigned int allowed = 0; allowed <= full; allowed++)
        {
            fill(height.begin(), height.end(), 0);
            ll cur = 0;
            for (int r = 0; r < n; r++)
            {
                for (int c = 0; c < n; c++)
                    height[c] = (cell[r * n + c] & ~allowed) ? 0 : height[c] + 1;
                int top = 0;
                for (int c = 0; c <= n; c++)
                {
                    int h = c == n ? 0 : height[c];
                    while (top && height[st[top - 1]] > h)
                    {
                        int mid = st[--top];
                        int left = top ? st[top - 1] : -1;
                        cur += 1LL * height[mid] * (mid - left) * (c - mid);
                    }
                    if (c < n) st[top++] = c;
                }
            }
            if ((__builtin_popcount(allowed) ^ k) & 1)
                ans -= cur;
            else
                ans += cur;
        }
        cout << ans << '\n';
        return;
    }

    ll ans = 0;
    const unsigned int full = (1U << k) - 1;

    alignas(16) short gap[32];
    alignas(16) short bitLo[8] = {1, 2, 4, 8, 16, 32, 64, 128};
    __m128i one16 = _mm_set1_epi16(1);
    __m128i mask16 = _mm_load_si128((__m128i *)bitLo);
    for (int r1 = 0; r1 < n; r1++)
    {
        vector<unsigned int> colMask(n, 0);
        for (int r2 = r1; r2 < n; r2++)
        {
            unsigned int rowOr = 0;
            for (int j = 0; j < n; j++)
            {
                colMask[j] |= cell[r2 * n + j];
                rowOr |= colMask[j];
            }
            if ((rowOr & full) != full) continue;
            for (int L = 0; L < 32; L++) gap[L] = (L < k) ? 1 : -30000;
            for (int c = 0; c < n; c++)
            {
                unsigned int m = colMask[c];
                __m128i mxv = _mm_setzero_si128();
                for (int L = 0; L < k; L += 8)
                {
                    unsigned int mb = (m >> L) & 0xFF;
                    __m128i mv = _mm_set1_epi16((short)mb);
                    __m128i t = _mm_and_si128(mv, mask16);
                    __m128i sel = _mm_cmpeq_epi16(t, _mm_setzero_si128());
                    __m128i g = _mm_load_si128((__m128i *)(gap + L));
                    g = _mm_add_epi16(g, one16);
                    g = _mm_and_si128(g, sel);
                    _mm_store_si128((__m128i *)(gap + L), g);
                    mxv = _mm_max_epi16(mxv, g);
                }

                __m128i t = _mm_shuffle_epi32(mxv, 0x4E);
                mxv = _mm_max_epi16(mxv, t);
                t = _mm_shufflelo_epi16(mxv, 0xB1);
                mxv = _mm_max_epi16(mxv, t);
                t = _mm_shufflehi_epi16(mxv, 0xB1);
                mxv = _mm_max_epi16(mxv, t);
                t = _mm_shufflelo_epi16(mxv, 0x4E);
                mxv = _mm_max_epi16(mxv, t);
                t = _mm_shufflehi_epi16(mxv, 0x4E);
                mxv = _mm_max_epi16(mxv, t);
                t = _mm_shuffle_epi32(mxv, 0x4E);
                mxv = _mm_max_epi16(mxv, t);
                int mx = (short)_mm_cvtsi128_si32(mxv);
                if (mx < 0) mx = 0;
                if (c - mx + 1 > 0) ans += c - mx + 1;
            }
        }
    }
    cout << ans << '\n';
}
```

:::

### Border Subgrid Count I


**题目大意**：给定 `n`、`k`（$n \le 3000$，$k \le 26$）与一个 $n\times n$ 字母网格，对每个字母分别统计「四条边（上下两行与左右两列）全部由该字母组成的正方形子网格」的个数。输出 `k` 行，每行一个字母的答案（不取模）。

**解题思路**：

- **观察**：边长为 `h` 的正方形由上下边 $r_1,\,r_2=r_1+h-1$ 与左右端 $c_1,\,c_2=c_1+h-1$ 确定，边框全为字母 `L` 等价于四条边各自落在同字母连续段内：上下两行在 $[c_1,c_2]$ 上恒为 `L`，左右两列在 $[r_1,r_2]$ 上恒为 `L`。$k = 1$ 时任何正方形都合法，答案为 $\sum_{h=1}^{n}(n-h+1)^2$，代码单独处理。

- **做法**：把「一列在 $[r_1,r_2]$ 上恒为同一字母」拆成相邻两行同字母，用 bitset 批量维护（每 64 列一个 `ull`）：`HQ[r]` 标记第 `r` 行水平相邻同字母的列，`VQ[r]` 标记第 `r`、`r+1` 行垂直同字母的列，`BL[L][r]` 标记第 `r` 行上是字母 `L` 的列。固定 `r2` 后让 `r1` 自下而上移动：$U=\bigcap_{r=r_1}^{r_2-1} VQ[r]$ 给出左列合法的列集合（每步只与 `VQ[r1]` 求交），`C2` 由 `HQ[r2]` 右移 `h-2` 位后逐层求交得到、标记「第 `r2` 行上与相距 `h-1` 的列同字母」的位置，即 $[c_1,c_1+h-1]$ 是第 `r2` 行同一段的左端，再把 `U` 右移 `h-1` 位得到右列合法的掩码（稠密情形预存到 `shU`）。最后在第 `r1` 行按同字母 run 枚举左端：run 按长度降序排序，用指针 `ptr[r1]` 剪掉长度不足 `h` 的 run，对每个 64 位词计算 `BL[L][r2] & C2 & U & (U >> (h-1))` 并 `popcount`，一次数出该 run 内的全部合法列对；`alive`/`aliveU` 两张「存活词表」用于跳过已变成全 0 的词。边长为 1 的正方形在开头按格逐个计入 `ans`。

- **正确性**：上述四个条件（左列恒同字母、右列恒同字母、下边同段、上边落在字母为 `L` 的 run 内）合起来正是「边框全为 `L`」的充要条件——左右两列恒同字母且其底端格为 `L`，故整列都是 `L`；每个正方形按唯一的上边 run 与列对统计一次，不重不漏。总时间复杂度为 $O(n^3/64)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
typedef unsigned long long ull;
void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    const int W = (n + 63) / 64;
    vector<ll> ans(k, 0);
    if (k == 1)
    {
        ll total = 0;
        for (ll h = 1; h <= n; h++) total += (n - h + 1) * (n - h + 1);
        cout << total << '\n';
        return;
    }
    struct Run
    {
        int s, e;
        unsigned char L;
    };
    vector<vector<Run>> runs(n);
    for (int r = 0; r < n; r++)
    {
        int c = 0;
        while (c < n)
        {
            int e = c;
            while (e + 1 < n && g[r][e + 1] == g[r][c]) e++;
            runs[r].push_back({c, e, (unsigned char)(g[r][c] - 'A')});
            c = e + 1;
        }
        sort(runs[r].begin(), runs[r].end(), [](const Run &a, const Run &b)
             { return (a.e - a.s) > (b.e - b.s); });
    }
    vector<vector<ull>> HQ(n, vector<ull>(W, 0)), VQ(n - 1, vector<ull>(W, 0));
    for (int r = 0; r < n; r++)
        for (int c = 0; c + 1 < n; c++)
            if (g[r][c] == g[r][c + 1]) HQ[r][c >> 6] |= 1ULL << (c & 63);
    for (int r = 0; r + 1 < n; r++)
        for (int c = 0; c < n; c++)
            if (g[r][c] == g[r + 1][c]) VQ[r][c >> 6] |= 1ULL << (c & 63);
    vector<vector<vector<ull>>> BL(26, vector<vector<ull>>(n, vector<ull>(W, 0)));
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            BL[g[r][c] - 'A'][r][c >> 6] |= 1ULL << (c & 63);
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            ans[g[r][c] - 'A']++;
    vector<int> ptr(n);
    for (int r = 0; r < n; r++) ptr[r] = (int)runs[r].size();
    vector<ull> U(W), C2(W), shU(W);
    vector<int> alive;
    vector<char> dead(W);
    vector<int> aliveU;
    vector<char> deadU(W);
    for (int r2 = 1; r2 < n; r2++)
    {
        U = VQ[r2 - 1];
        C2 = HQ[r2];
        alive.clear();
        aliveU.clear();
        fill(dead.begin(), dead.end(), 0);
        fill(deadU.begin(), deadU.end(), 0);
        for (int w = 0; w < W; w++)
        {
            if (U[w]) aliveU.push_back(w);
            if (U[w] & C2[w]) alive.push_back(w);
        }
        int deadCnt = 0, deadUCnt = 0;
        for (int r1 = r2 - 1; r1 >= 0; r1--)
        {
            int h = r2 - r1 + 1;
            if (r1 < r2 - 1)
            {
                int sft = h - 2, ws = sft >> 6, sh = sft & 63;
                for (int &w : aliveU)
                {
                    if (deadU[w]) continue;
                    U[w] &= VQ[r1][w];
                    if (!U[w])
                    {
                        deadU[w] = 1;
                        deadUCnt++;
                    }
                }
                if (deadUCnt * 2 > (int)aliveU.size())
                {
                    vector<int> nxt;
                    for (int &w : aliveU)
                        if (!deadU[w]) nxt.push_back(w);
                    aliveU.swap(nxt);
                    deadUCnt = 0;
                }
                for (int &w : alive)
                {
                    if (dead[w]) continue;
                    ull v = 0;
                    if (w + ws < W) v = HQ[r2][w + ws] >> sh;
                    if (sh && w + ws + 1 < W) v |= HQ[r2][w + ws + 1] << (64 - sh);
                    C2[w] &= v;
                    if (!(U[w] & C2[w]))
                    {
                        dead[w] = 1;
                        deadCnt++;
                        C2[w] = 0;
                    }
                }
                if (deadCnt * 2 > (int)alive.size())
                {
                    vector<int> nxt;
                    for (int &w : alive)
                        if (!dead[w]) nxt.push_back(w);
                    alive.swap(nxt);
                    deadCnt = 0;
                }
                if (alive.empty()) break;
            }
            int sft = h - 1, ws = sft >> 6, sh = sft & 63;
            const bool dense = (int)alive.size() >= 40;
            if (dense)
            {
                for (int w = 0; w < W; w++)
                {
                    ull v = 0;
                    if (w + ws < W) v = U[w + ws] >> sh;
                    if (sh && w + ws + 1 < W) v |= U[w + ws + 1] << (64 - sh);
                    shU[w] = v;
                }
            }
            while (ptr[r1] > 0 && (runs[r1][ptr[r1] - 1].e - runs[r1][ptr[r1] - 1].s + 1) < h) ptr[r1]--;
            const auto &rl = runs[r1];
            const int AL = (int)alive.size();
            const int *alv = alive.data();
            for (int i = 0; i < ptr[r1]; i++)
            {
                int s = rl[i].s, e = rl[i].e;
                int lo = s, hi = e - h + 1;
                const ull *B = BL[(int)rl[i].L][r2].data();
                int w1 = lo >> 6, w2 = hi >> 6;
                ll cnt = 0;
                int a;
                if (dense)
                {
                    a = w1;
                }
                else
                {
                    int Lft = 0, Rgt = AL - 1, rr = AL;
                    while (Lft <= Rgt)
                    {
                        int mid = (Lft + Rgt) >> 1;
                        if (alv[mid] >= w1)
                        {
                            rr = mid;
                            Rgt = mid - 1;
                        }
                        else
                            Lft = mid + 1;
                    }
                    a = rr;
                }
                for (int idx = a; idx < AL; idx++)
                {
                    int w = alv[idx];
                    if (w > w2) break;
                    if (dead[w]) continue;
                    ull v;
                    if (dense)
                        v = shU[w];
                    else
                    {
                        v = 0;
                        if (w + ws < W) v = U[w + ws] >> sh;
                        if (sh && w + ws + 1 < W) v |= U[w + ws + 1] << (64 - sh);
                    }
                    ull x = B[w] & C2[w] & U[w] & v;
                    if (!x) continue;
                    if (w1 == w2)
                    {
                        ull msk = (~0ULL >> (63 - (hi & 63))) & (~0ULL << (lo & 63));
                        cnt += __builtin_popcountll(x & msk);
                    }
                    else if (w == w1)
                    {
                        cnt += __builtin_popcountll(x & (~0ULL << (lo & 63)));
                    }
                    else if (w == w2)
                    {
                        cnt += __builtin_popcountll(x & (~0ULL >> (63 - (hi & 63))));
                    }
                    else
                    {
                        cnt += __builtin_popcountll(x);
                    }
                }
                ans[(int)rl[i].L] += cnt;
            }
        }
    }
    for (int c = 0; c < k; c++) cout << ans[c] << '\n';
}
```

:::

### Border Subgrid Count II


**题目大意**：给定 `n`、`k`（$n \le 3000$，$k \le 26$）与一个 $n\times n$ 字母网格，对每个字母分别统计「四条边（上下两行与左右两列）全部由该字母组成的矩形子网格」的个数。输出 `k` 行，每行一个字母的答案（不取模）。

**解题思路**：

- **做法**：枚举行对 `(r1, r2)`（`len = r2 - r1 + 1`），把第 `r1` 行按「与第 `r2` 行同字母」切成极大同字母段：段 `[j, e)` 内两行在每一列都等于同一个字母 `L`。再在段内扫描列 `c`，用预处理的高 `up[r2][c]`（列 `c` 从第 `r2` 行向上连续同字母的长度）判断：`up[r2][c] >= len` 说明该列从 `r1` 到 `r2` 全是 `L`，可作为一条竖边。维护段内到当前列为止的合法列数 `pref`，遇到合法列时先 `pref++`、再 `total += pref`，即把它作为右端与该段内每个不超过它的合法列配成一对，最后 `ans[L] += total`。

- **正确性**：边框全为 `L` 的充要条件是上下边在 $[c_1,c_2]$ 上全为 `L`、左右两列在 $[r_1,r_2]$ 上全为 `L`；前者等价于 $[c_1,c_2]$ 落在两行的同字母段内，后者等价于左右两列的 `up` 都不小于 `len`。于是给定行对时合法列对恰好是段内合法列之间的（左端不超过右端）配对数，`total` 把它们统计一次；每个矩形由唯一的行对与列对确定。左右端可以相同（宽 1 的一列）、`r1` 与 `r2` 也可以相同（高 1 的一行），退化的四边重合情形同样计入。总时间复杂度为 $O(n^3)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, k;
    cin >> n >> k;
    vector<string> g(n);
    for (auto &r : g) cin >> r;
    vector<vector<int>> up(n, vector<int>(n, 1));
    for (int i = 1; i < n; i++)
        for (int j = 0; j < n; j++)
            up[i][j] = (g[i][j] == g[i - 1][j]) ? up[i - 1][j] + 1 : 1;
    vector<ll> ans(k, 0);
    for (int r1 = 0; r1 < n; r1++)
        for (int r2 = r1; r2 < n; r2++)
        {
            int len = r2 - r1 + 1;
            int j = 0;
            while (j < n)
            {
                if (g[r1][j] != g[r2][j])
                {
                    j++;
                    continue;
                }
                int L = g[r1][j] - 'A';
                int e = j;
                while (e < n && g[r1][e] == g[r2][e] && g[r1][e] - 'A' == L) e++;
                ll pref = 0, total = 0;
                for (int c = j; c < e; c++)
                {
                    if (up[r2][c] >= len)
                    {
                        pref++;
                        total += pref;
                    }
                }
                ans[L] += total;
                j = e;
            }
        }
    for (int c = 0; c < k; c++) cout << ans[c] << '\n';
}
```

:::

### Raab Game II


**题目大意**：`t` 组询问（$n \le 3000$）。两人各有 $1..n$ 的一副牌，各出 `n` 轮、每轮各出一张且每张牌恰好用一次，点数大的一方在该轮得 1 分、点数相同双方都不得分。给定 `n, a, b`，统计使终局比分恰为 `a : b` 的双方出牌顺序对数，对 $10^9+7$ 取模，每组询问输出一行。

**解题思路**：

- **观察**：把玩家 1 的牌序固定（共 $n!$ 种），胜负只取决于「玩家 2 的每张牌与它同轮对上的牌」这一双射。设玩家 1 在第 `i` 轮出牌 `i`、玩家 2 在第 `i` 轮出牌 $\pi_i$（$\pi$ 是 $1..n$ 的排列）：玩家 1 得 1 分当且仅当 $\pi_i<i$，玩家 2 得 1 分当且仅当 $\pi_i>i$。于是需要 $\pi$ 中恰有 `a` 个「小于」位置、`b` 个「大于」位置、`t = n-a-b` 个不动点位置，答案为 $n!\cdot\binom{n}{t}\cdot G$：$\binom{n}{t}$ 选定不动点位置后，剩下的位置与剩下的牌是同一个集合，`G` 是该集合上「无不动点且恰有 `a` 个小于位置」的双射个数。

- **做法**：`G` 用容斥：先允许不动点，把 `j` 个指定位置强制成不动点后，剩余 `k-j` 个位置（`k = a+b`）上恰有 `a` 个「小于」位置的双射个数等于欧拉数 $A(k-j,a)$——$A(m,a)$ 是 $1..m$ 的排列中恰有 `a` 个上升 $\pi_i<\pi_{i+1}$ 的排列数，它与「恰有 `a` 个 $\pi_i<i$」的排列数相等，于是 $G=\sum_{j=0}^{k-a}(-1)^j\binom{k}{j}A(k-j,a)$（$k-j\le a$ 时 $A(k-j,a)=0$，故 `j` 枚举到 `k-a` 即可）。代码把欧拉数按 $A(m,a)=(a+1)A(m-1,a)+(m-a)A(m-1,a-1)$ 递推预存到 `eul`，阶乘 `fact` 与逆元阶乘 `invf` 预处理到所有询问中最大的 `maxN`，组合数由 `C` 支持 $O(1)$ 查询。

- **边界**：`k > n` 时无解，代码直接输出 0；`maxK` 取所有询问中 `a+b` 的最大值、`maxN` 取 `n` 的最大值，预处理范围与它们一致。$n!$ 还原玩家 1 的全部牌序，$\binom{n}{t}$ 与无不动点部分的计数相互独立，三者相乘即全部方案。预处理时间复杂度为 $O(maxN+maxK^2)$，每组时间复杂度为 $O(maxK)$，空间复杂度为 $O(maxN+maxK^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;

void solve()
{
    int t;
    cin >> t;
    vector<int> qn(t), qa(t), qb(t);
    int maxN = 0, maxK = 0;
    for (int i = 0; i < t; i++)
    {
        cin >> qn[i] >> qa[i] >> qb[i];
        maxN = max(maxN, qn[i]);
        maxK = max(maxK, qa[i] + qb[i]);
    }

    vector<ll> fact(maxN + 1, 1), invf(maxN + 1, 1);
    for (int i = 1; i <= maxN; i++) fact[i] = fact[i - 1] * i % MOD;
    auto pw = [&](ll x, ll e)
    {
        ll r = 1;
        while (e)
        {
            if (e & 1) r = r * x % MOD;
            x = x * x % MOD;
            e >>= 1;
        }
        return r;
    };
    invf[maxN] = pw(fact[maxN], MOD - 2);
    for (int i = maxN; i >= 1; i--) invf[i - 1] = invf[i] * i % MOD;
    auto C = [&](int x, int y) -> ll
    {
        if (y < 0 || y > x) return 0;
        return fact[x] * invf[y] % MOD * invf[x - y] % MOD;
    };

    vector<vector<int>> eul(maxK + 1);
    eul[0] = {1};
    for (int m = 1; m <= maxK; m++)
    {
        eul[m].assign(m + 1, 0);
        eul[m][0] = 1;
        for (int a = 1; a < m; a++)
        {
            ll v = (ll)(a + 1) * eul[m - 1][a] + (ll)(m - a) * eul[m - 1][a - 1];
            eul[m][a] = v % MOD;
        }
    }
    for (int i = 0; i < t; i++)
    {
        int n = qn[i], a = qa[i], b = qb[i];
        int k = a + b;
        if (k > n)
        {
            cout << 0 << '\n';
            continue;
        }
        int tie = n - k;
        ll inner = 0;
        for (int j = 0; j <= k - a; j++)
        {
            ll term = C(k, j) * eul[k - j][a] % MOD;
            if (j & 1)
                inner = (inner - term + MOD) % MOD;
            else
                inner = (inner + term) % MOD;
        }
        ll ans = fact[n] * C(n, tie) % MOD * inner % MOD;
        cout << ans << '\n';
    }
}
```

:::

### Empty String


**题目大意**：给定一个字符串 `s`（$|s| \le 500$），每次操作删除两个相邻且相同的字符，求按操作步骤顺序把整个字符串删空的方案数（无法删空则为 0），对 $10^9+7$ 取模。

**解题思路**：

- **观察**：区间 DP，被删空的区间长度必为偶数，`dp[l][r]` 表示把 `s[l..r]` 删空的方案数。考虑字符 `s[l]`：它必定与某个 `s[k]` 作为一对被删除，这一对不必相邻，但删除它时中间的 `[l+1, k-1]` 必须已经删空、右侧 `[k+1, r]` 在其后删空；由于中间段的长度 $k-l-1$ 必须为偶数，只有 $k-l$ 为奇数（`k` 与 `l` 奇偶性不同）且 `s[k] == s[l]` 的 `k` 可行。

- **做法**：按区间长度递增计算，对每个可行的 `k` 累加 `dp[l][r] += dp[l+1][k-1] * dp[k+1][r] * C[total][a+1]`，其中 `total = (r-l+1)/2` 是区间内的配对数、`a = (k-l-1)/2` 是中间段的配对数，空区间的 `dp` 取 1。因子 `C[total][a+1]` 来自两侧交错计数：把 `total` 对配对的先后顺序看成一个序列，左侧的 $a+1$ 对（中间段的 `a` 对与 `(l,k)` 这一对，其中 `(l,k)` 必在中间段之后）与右侧的 $total-(a+1)$ 对互相交错，先选出左侧 $a+1$ 对占据的时刻即可（`C` 用杨辉三角预处理）。

- **正确性**：每条删除序列按「`s[l]` 与谁配对」划分到唯一的 `k`，配对时刻的选取由二项式系数精确计数，两侧互不干扰，故不重不漏；长度递增保证子区间已经算好。总时间复杂度为 $O(n^3)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;

void solve()
{
    string s;
    cin >> s;
    int n = s.size();
    vector<vector<ll>> C(n + 1, vector<ll>(n + 1, 0));
    for (int i = 0; i <= n; i++)
    {
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; j++) C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD;
    }
    vector<vector<ll>> dp(n, vector<ll>(n, 0));
    for (int len = 2; len <= n; len += 2)
    {
        for (int l = 0; l + len - 1 < n; l++)
        {
            int r = l + len - 1;

            for (int k = l + 1; k <= r; k += 2)
            {
                if (s[l] != s[k]) continue;
                ll left = (l + 1 <= k - 1) ? dp[l + 1][k - 1] : 1;
                ll right = (k + 1 <= r) ? dp[k + 1][r] : 1;
                int total = (r - l + 1) / 2;
                int a = (k - l - 1) / 2;
                dp[l][r] = (dp[l][r] + left * right % MOD * C[total][a + 1]) % MOD;
            }
        }
    }
    cout << dp[0][n - 1] << '\n';
}
```

:::

### Permutation Inversions


**题目大意**：给定 `n`、`k`（$n \le 500$，$k \le n(n-1)/2$），统计 $1..n$ 的排列中恰有 `k` 个逆序对的排列数，对 $10^9+7$ 取模；逆序对指满足 $i<j$ 且 $p_i>p_j$ 的下标对。

**解题思路**：按值从小到大插入。`dp[j]` 为当前个数下恰有 `j` 个逆序对的排列数，把新元素 `i`（大于已有的 $i-1$ 个数）插入 `i` 个空隙时，它后面有 `t` 个数就会新增 `t` 个逆序对（`t` 取 $0..i-1$），故 $dp'[j]=\sum_{t=0}^{i-1}dp[j-t]$，即上一轮 `dp` 上长度为 `i` 的滑动窗口和，用前缀和 `pref` 每次 $O(1)$ 转移（新一轮由 `ndp` 承接）。每一轮只需算到 `lim = min(k, i*(i-1)/2)`，因为 `i` 个数的逆序对数最多 $i(i-1)/2$；`k` 超过 $n(n-1)/2$ 时无解，代码在开头直接输出 0。时间复杂度为 $O(nk)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve()
{
    int n, k;
    cin >> n >> k;
    ll maxK = 1LL * n * (n - 1) / 2;
    if (k > maxK)
    {
        cout << 0 << '\n';
        return;
    }
    vector<ll> dp(k + 1, 0);
    dp[0] = 1;
    for (int i = 2; i <= n; i++)
    {
        vector<ll> ndp(k + 1, 0), pref(k + 1, 0);
        pref[0] = dp[0];
        int lim = min(k, i * (i - 1) / 2);
        for (int j = 1; j <= lim; j++) pref[j] = (pref[j - 1] + dp[j]) % MOD;
        for (int j = 0; j <= lim; j++)
        {
            int lo = max(0, j - (i - 1));
            ndp[j] = (pref[j] - (lo > 0 ? pref[lo - 1] : 0) + MOD) % MOD;
        }
        dp = ndp;
    }
    cout << dp[k] << '\n';
}
```

:::

### Counting Bishops


**题目大意**：在 $n\times n$ 棋盘上放 $k$ 个互不攻击的象（同一斜线上会互相攻击），求方案数，对 $10^9+7$ 取模（$n\le 500$）。

**解题思路**：

- **按颜色拆分**：象永远待在同色格上，所以黑格与白格互相独立，答案等于两者方案数的卷积（对 $k$ 取系数）。
- **同色 = 车多项式**：一种颜色里，一个象占一条 `/` 斜线和一条 `\` 斜线，互不攻击 ⟺ 所有 `/`、`\` 斜线都互不相同 ⟺ 在「行 = `/` 斜线、列 = `\` 斜线」的 0/1 棋盘上放互不攻击的车。该棋盘的行区间**两两嵌套**（是 Ferrers 棋盘），因此列高按**升序**处理时，新列的可用行集合包含之前的行集合，车数递推就是
$$dp[j]\mathrel{+}=dp[j-1]\cdot(h-(j-1)).$$
- **一个踩过的坑**：这个递推的列高必须**升序**处理（保证嵌套方向），我一开始写成降序，样例算出 900 而不是 2728。改升序后两种颜色的车数分别是 $(1,13,46,46,8,0)$ 与 $(1,12,38,32,4)$，卷积在 $k=4$ 处正好是 $1\cdot4+13\cdot32+46\cdot38+46\cdot12+8\cdot1=2728$，与样例一致。
- **复杂度**：建棋盘的时间复杂度为 $O(n^2)$，车多项式为 $O(n^2)$，两色卷积为 $O(n^2)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1000000007LL;

vector<ll> colorRooks(int n, int parity)
{
    vector<vector<int>> rows;
    for (int d = 2; d <= 2 * n; d++)
    {
        vector<int> es;
        for (int r = 1; r <= n; r++)
        {
            int c = d - r;
            if (c < 1 || c > n) continue;
            if ((r + c) % 2 != parity) continue;
            es.push_back(r - c + n);            // "\" 斜线编号
        }
        if (!es.empty()) { sort(es.begin(), es.end()); rows.push_back(es); }
    }
    if (rows.empty()) return {1};

    vector<int> all;
    for (auto &v : rows) for (int e : v) all.push_back(e);
    sort(all.begin(), all.end());
    all.erase(unique(all.begin(), all.end()), all.end());

    vector<int> height(all.size(), 0);
    for (auto &v : rows)
        for (int e : v)
            height[lower_bound(all.begin(), all.end(), e) - all.begin()]++;
    sort(height.begin(), height.end());          // 升序：新列的行集合包含之前的

    vector<ll> dp(1, 1);
    for (int h : height)
    {
        vector<ll> nd = dp;
        nd.resize(dp.size() + 1, 0);
        for (int j = (int)dp.size(); j >= 1; j--)
        {
            ll ways = h - (j - 1);
            if (ways <= 0) continue;
            nd[j] = (nd[j] + dp[j - 1] * ways) % MOD;
        }
        dp.swap(nd);
    }
    return dp;
}

void solve()
{
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> A = colorRooks(n, 0), B = colorRooks(n, 1);
    if (k > (ll)A.size() - 1 + (ll)B.size() - 1) { cout << 0 << "\n"; return; }
    ll ans = 0;
    for (int i = 0; i < (int)A.size(); i++)
    {
        ll j = k - i;
        if (j < 0 || j >= (ll)B.size()) continue;
        ans = (ans + A[i] * B[j]) % MOD;
    }
    cout << ans << "\n";
}
```

:::

### Counting Sequences


**题目大意**：给定 `n`、`k`（$k \le n \le 10^6$），统计长度为 `n`、每个位置取值 $1..k$ 且 $1..k$ 每个值**至少出现一次**的序列个数，对 $10^9+7$ 取模。

**解题思路**：容斥。先选 `i` 个值禁用（$\binom{k}{i}$ 种选法），其余 `n` 个位置每个都能取剩下 $k-i$ 个值中的任意一个，得到 $\binom{k}{i}(k-i)^n$；对 `i` 求和并交替取符号，即 $\sum_{i=0}^{k}(-1)^i\binom{k}{i}(k-i)^n$——恰有 `j` 个值缺失的序列被计入 $\binom{j}{i}$ 次，正负相消后只剩无值缺失的序列。代码预处理阶乘 `fact` 与逆元阶乘 `invf`（$k \le 10^6 < 10^9+7$，`fact[k]` 可逆）以 $O(1)$ 求组合数，用 `pw` 快速幂求 $(k-i)^n$；$i=k$ 时 $0^n=0$（$n \ge 1$），不影响结果。时间复杂度为 $O(k\log n)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
ll pw(ll a, ll b)
{
    ll r = 1;
    while (b)
    {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
void solve()
{
    ll n, k;
    cin >> n >> k;

    vector<ll> fact(k + 1, 1), invf(k + 1, 1);
    for (int i = 1; i <= k; i++) fact[i] = fact[i - 1] * i % MOD;
    invf[k] = pw(fact[k], MOD - 2);
    for (int i = k; i >= 1; i--) invf[i - 1] = invf[i] * i % MOD;
    auto C = [&](ll a, ll b)
    { return fact[a] * invf[b] % MOD * invf[a - b] % MOD; };
    ll ans = 0;
    for (int i = 0; i <= k; i++)
    {
        ll term = C(k, i) * pw(k - i, n) % MOD;
        if (i & 1)
            ans = (ans - term + MOD) % MOD;
        else
            ans = (ans + term) % MOD;
    }
    cout << ans << '\n';
}
```

:::

### Grid Paths II


**题目大意**：给定 `n`、`m`（$n \le 10^6$，$m \le 1000$）与一个 $n\times n$ 网格上的 `m` 个陷阱坐标，从左上角 `(1,1)` 走到右下角 `(n,n)`、每步只能向右或向下，求不经过任何陷阱的路径数，对 $10^9+7$ 取模。

**解题思路**：

- **观察**：把 `m` 个陷阱与终点 `(n,n)` 一起作为关键点排序，`dp[i]` 表示从起点走到第 `i` 个关键点、途中不经过任何更靠前关键点的路径数。无陷阱时从 $(0,0)$ 到 `(x,y)` 的路径数为 $\binom{x+y-2}{x-1}$。

- **做法**：设第 `i` 个关键点坐标为 $(x_i,y_i)$，先取全部路径数 $\binom{x_i+y_i-2}{x_i-1}$，再减去先经过前面某个可达关键点的路径：$dp[i]=$ 全部路径数 $-\sum_{j<i}dp[j]\cdot\binom{x_i-x_j+y_i-y_j}{x_i-x_j}$，求和只对 $x_j \le x_i$ 且 $y_j \le y_i$ 的 `j` 进行。终点被 `a.emplace_back(n, n)` 追加为最后一个关键点，答案即 `dp[m]`。组合数由 `INIT(2 * n)` 支持：`A` 为阶乘、`S` 为阶乘的前缀积，先用一次 `qpow(S[2 * n], mod - 2)` 整体求逆、再回推得到逆元阶乘 `inv`，于是 `C` 可 $O(1)$ 查询；预处理范围开到 $2n$，因为坐标和的最大值为 $2n-2$。

- **正确性**：按「第一个经过的关键点」划分路径，任意一条经过陷阱的路径都以某个 `j` 为路上第一个关键点，减去 $dp[j]$ 乘「从 `j` 到 `i` 的路径数」时恰好把它排除，不重不漏。预处理时间复杂度为 $O(n)$，总时间复杂度为 $O(m^2)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 2e6 + 7;                     // INIT(2 * n) 会写到下标 2n，n <= 1e6
const int mod = 1e9 + 7;
ll A[N], S[N], inv[N];
ll qpow(ll a, ll n)
{
    ll res = 1;
    while (n)
    {
        if (n & 1) res = res * a % mod;
        a = a * a % mod;
        n >>= 1;
    }
    return res;
}
void INIT(int n)
{
    A[0] = S[0] = 1;
    for (int i = 1; i <= n; i++) A[i] = A[i - 1] * i % mod;
    for (int i = 1; i <= n; ++i) S[i] = S[i - 1] * A[i] % mod;
    inv[n] = qpow(S[n], mod - 2);
    for (int i = n; i >= 1; --i) inv[i - 1] = inv[i] * A[i] % mod;
    for (int i = 1; i <= n; ++i) inv[i] = inv[i] * S[i - 1] % mod;
}
ll C(ll n, ll m)
{
    return A[n] * inv[m] % mod * inv[n - m] % mod;
}
ll n, m;
ll dp[N];
void solve()
{
    cin >> n >> m;
    INIT(2 * n);
    vector<pair<int, int>> a;
    for (int i = 1; i <= m; i++)
    {
        int u, v;
        cin >> u >> v;
        a.emplace_back(u, v);
    }
    a.emplace_back(n, n);
    sort(a.begin(), a.end());
    for (int i = 0; i <= m; i++)
    {
        ll res = C(a[i].first + a[i].second - 2, a[i].first - 1);
        for (int j = 0; j <= i - 1; j++)
        {
            if (a[i].first >= a[j].first && a[i].second >= a[j].second)
            {
                res = (((res - (dp[j] * C(a[i].first - a[j].first + a[i].second - a[j].second,
                                          a[i].first - a[j].first)) %
                                   mod)) %
                           mod +
                       mod) %
                      mod;
            }
        }
        dp[i] = res;
    }
    cout << dp[m] << '\n';
}
```

:::

### Counting Permutations


**题目大意**：给定 `n`（$n \le 500$），统计 $1..n$ 的排列中不存在相邻元素之差为 1 的排列数，对 $10^9+7$ 取模。

**解题思路**：

- **做法**：把「差 1 且相邻」的数对称为坏对。`dp[j][b]` 记录已排好 $1..i$ 的排列中「恰有 `j` 个坏对、且 `b` 表示 `i` 与 `i-1` 是否相邻」的排列数（初始 `dp[1][1] = 2`，对应 $i=2$ 的两个排列都含坏对 $(1,2)$，此时 `b` 表示 `2` 与 `1` 相邻）。把 `i+1` 插入 `i` 个数形成的 `i+1` 个空隙，按空隙与 `i` 的位置关系分类：

  - 与 `i` 相邻的两个空隙：`b = 0` 时两处都在外侧，插入后各新增坏对 $(i,i+1)$，`ndp[j+1][1] += v * 2`；`b = 1` 时一处在外侧、插入后同样新增 $(i,i+1)$（`ndp[j+1][1] += v`），另一处在 `i` 与 `i-1` 之间，插入后拆掉坏对 $(i-1,i)$、同时新增 $(i,i+1)$，坏对数不变（`ndp[j][1] += v`）；

  - 其余 $i-1$ 个空隙中，`badGaps = j - b` 个位于某个坏对中间（插入拆掉该坏对、不产生新坏对），`ndp[j-1][0] += v * badGaps`；剩下的 $i-1-badGaps$ 个不改变坏对数，`ndp[j][0] += v * (i-1-badGaps)`。

- **边界**：答案取 `dp[0][0]`（无坏对且 `n` 与 `n-1` 不相邻）；`n = 1` 时唯一的排列没有相邻对，代码单独输出 1，避免对越界下标取值。总时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;
void solve()
{
    int n;
    cin >> n;
    if (n == 1)
    {
        cout << 1 << '\n';
        return;
    }
    vector<vector<ll>> dp(n + 1, vector<ll>(2, 0));
    dp[1][1] = 2;
    for (int i = 3; i <= n; i++)
    {
        vector<vector<ll>> ndp(n + 1, vector<ll>(2, 0));
        for (int j = 0; j <= n; j++)
            for (int b = 0; b < 2; b++)
            {
                ll v = dp[j][b];
                if (!v) continue;
                if (b)
                {
                    ndp[j][1] = (ndp[j][1] + v) % MOD;
                    ndp[j + 1][1] = (ndp[j + 1][1] + v) % MOD;
                }
                else
                {
                    ndp[j + 1][1] = (ndp[j + 1][1] + v * 2) % MOD;
                }
                int badGaps = j - b;
                if (j - 1 >= 0) ndp[j - 1][0] = (ndp[j - 1][0] + v * badGaps) % MOD;
                ndp[j][0] = (ndp[j][0] + v * (i - 2 - badGaps)) % MOD;
            }
        dp = ndp;
    }
    cout << dp[0][0] % MOD << '\n';
}
```

:::

### Grid Completion

**题目大意**：给一个 $n \times n$ 的网格（$n \le 500$），每行每列都要恰好放一个 `A` 和一个 `B`，部分格子已经给出（保证每行每列至多一个 `A`、至多一个 `B`）。求补全方案数对 $10^9+7$ 取模。

**解题思路**：

- **观察**：把 `A` 的位置记成排列 `p`、`B` 的位置记成排列 `q`（`p[i]` 表示第 `i` 行的 `A` 所在列），补全要求就是 $p_i \ne q_i$。`A` 与 `B` 可区分，所以 $(p, q)$ 是有序对。已给出的格子相当于固定了 $p$、$q$ 的部分取值。

- **做法**：对「被强制 $p_i = q_i$ 的行集合」做容斥。设 `inP`、`inQ` 分别是已给定的 `A`、`B` 列集合，统计四类量：`c0` 为 `p` 与 `q` 都空的行数、`c1` 为 `p` 空而 `q` 已给且该列不属 `inP` 的行数、`c2` 对称、`c3` 为既不在 `inP` 也不在 `inQ` 的列数，`pn`、`qn` 为 `p`、`q` 仍空的行数。答案为

$$\sum_{i=0}^{\min(c_0,c_3)}\ \sum_{j=0}^{c_1}\ \sum_{k=0}^{c_2} (-1)^{i+j+k}\binom{c_0}{i}\binom{c_1}{j}\binom{c_2}{k}\binom{c_3}{i}\, i!\,(pn-i-j)!\,(qn-i-k)!$$

  代码把 $j$ 与 $k$ 两重和先各自算成只依赖 $i$ 的 `J`、`K`，外层只枚举 $i$。

- **正确性**：容斥的各项含义是——被选中的 $i$ 个「双空行」必须取同一列，而该列不能是任何已给字母所在的列，因此要从 `c3` 列里选 $i$ 个并做配对（$\binom{c_3}{i} i!$）；`c1` 里的行被强制取已给出的那个值，没有自由度，`c2` 同理。这三类固定完后，`A` 剩 `pn-i-j` 个空行与等量空列，方案数为阶乘，`B` 独立同算，符号为 $(-1)^{i+j+k}$。

- **边界**：输入保证每行每列至多一个 `A`、一个 `B`，所以已给值互不冲突、必定可补完；`c3` 必须同时排除 `inP` 与 `inQ`（同一列可以上面有 `A`、下面有 `B`）；$i$ 的上界取 $\min(c_0,c_3)$，因为只有 `c3` 个完全空闲的列可供双空行使用。总时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
static const ll MOD = 1000000007;

static ll pw(ll a, ll b)
{
    ll r = 1;
    a %= MOD;
    while (b)
    {
        if (b & 1)
            r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}

void solve()
{
    int n;
    cin >> n;
    vector<string> g(n);
    for (auto &s : g)
        cin >> s;
    vector<int> p(n, -1), q(n, -1);
    vector<char> inP(n + 1, 0), inQ(n + 1, 0);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
        {
            if (g[i][j] == 'A')
            {
                p[i] = j + 1;
                inP[j + 1] = 1;
            }
            else if (g[i][j] == 'B')
            {
                q[i] = j + 1;
                inQ[j + 1] = 1;
            }
        }
    ll c0 = 0, c1 = 0, c2 = 0, c3 = 0, pn = 0, qn = 0;
    for (int i = 0; i < n; i++)
    {
        if (p[i] < 0)
            pn++;
        if (q[i] < 0)
            qn++;
    }
    for (int i = 0; i < n; i++)
    {
        if (p[i] < 0 && q[i] < 0)
            c0++;
        else if (p[i] < 0 && q[i] > 0 && !inP[q[i]])
            c1++;
        else if (p[i] > 0 && q[i] < 0 && !inQ[p[i]])
            c2++;
    }
    for (int j = 1; j <= n; j++)
        if (!inP[j] && !inQ[j])
            c3++;
    int N = (int)max(pn, qn) + 2;
    vector<ll> f(N + 1), inv(N + 1);
    f[0] = 1;
    for (int i = 1; i <= N; i++)
        f[i] = f[i - 1] * i % MOD;
    inv[N] = pw(f[N], MOD - 2);
    for (int i = N; i >= 1; i--)
        inv[i - 1] = inv[i] * i % MOD;
    auto C = [&](ll a, ll b) -> ll
    {
        if (a < 0 || b < 0 || b > a)
            return 0;
        return f[a] * inv[b] % MOD * inv[a - b] % MOD;
    };
    ll lim = min(c0, c3), ans = 0;
    for (ll i = 0; i <= lim; i++)
    {
        ll J = 0, K = 0;
        for (ll j = 0; j <= c1; j++)
        {
            ll t = C(c1, j) * f[pn - i - j] % MOD;
            if (j & 1)
                J = (J - t + MOD) % MOD;
            else
                J = (J + t) % MOD;
        }
        for (ll k = 0; k <= c2; k++)
        {
            ll t = C(c2, k) * f[qn - i - k] % MOD;
            if (k & 1)
                K = (K - t + MOD) % MOD;
            else
                K = (K + t) % MOD;
        }
        ll t = C(c0, i) * C(c3, i) % MOD * f[i] % MOD * J % MOD * K % MOD;
        if (i & 1)
            ans = (ans - t + MOD) % MOD;
        else
            ans = (ans + t) % MOD;
    }
    cout << ans % MOD << '\n';
}
```

:::

### Counting Reorders


**题目大意**：$|s|\le 5000$ 的小写字符串，求重排后**任意相邻字符都不同**的方案数，对 $10^9+7$ 取模。

**解题思路**：

- **容斥（星星与棒）**：对每个字符，若它有 $c$ 个，把它合并成 $j$ 个非空连续块，方案数 $\binom{c-1}{j-1}$，符号 $(-1)^{c-j}$；再把所有字符的块自由排列，方案数 $\frac{(\sum j_i)!}{\prod j_i!}$。于是
$$\text{answer}=\sum_{j_1,\dots,j_k}(-1)^{n-\sum j_i}\prod_i\binom{c_i-1}{j_i-1}\cdot\frac{(\sum j_i)!}{\prod_i j_i!}.$$
  这个式子的含义是：每个排列被按「块的选取方式」恰好计一次，容斥抵消掉所有「相邻同字符」的情形。

- **实现**：把上式折进一个按字符种类推进的 DP：$f[J]$ = 已处理字符、块数之和为 $J$ 时的 $\prod\left[(-1)^{c_i-j_i}\binom{c_i-1}{j_i-1}/j_i!\right]$，最后答案 $=\sum_J f[J]\cdot J!$。每个字符 $J$ 到 $n$、$j_i$ 到 $c_i$，总时间复杂度为 $O(n\sum c_i)=O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1000000007LL;

ll pw(ll a, ll b)
{
    ll r = 1;
    a %= MOD;
    while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; }
    return r;
}

void solve()
{
    string s;
    cin >> s;
    int n = s.size();
    vector<int> cnt(26, 0);
    for (char ch : s) cnt[ch - 'a']++;
    vector<int> cs;
    for (int c : cnt) if (c > 0) cs.push_back(c);

    vector<ll> fact(n + 1, 1), invFact(n + 1, 1);
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[n] = pw(fact[n], MOD - 2);
    for (int i = n; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;

    vector<ll> f(n + 1, 0), g(n + 1, 0);
    f[0] = 1;
    int maxJ = 0;
    for (int c : cs)
    {
        // w[j] = (-1)^(c-j) * C(c-1, j-1) / j!
        vector<ll> w(c + 1, 0);
        for (int j = 1; j <= c; j++)
        {
            ll comb = fact[c - 1] * invFact[j - 1] % MOD * invFact[c - j] % MOD;
            ll v = comb * invFact[j] % MOD;
            if ((c - j) & 1) v = (MOD - v) % MOD;
            w[j] = v;
        }
        fill(g.begin(), g.end(), 0);
        for (int J = 0; J <= maxJ; J++)
        {
            if (!f[J]) continue;
            for (int j = 1; j <= c; j++) g[J + j] = (g[J + j] + f[J] * w[j]) % MOD;
        }
        f.swap(g);
        maxJ += c;
    }

    ll ans = 0;
    for (int J = 1; J <= n; J++) ans = (ans + f[J] * fact[J]) % MOD;
    cout << ans << "\n";
}
```

:::

### Tournament Graph Distribution


**题目大意**：给定 `n`（$n \le 500$），统计 `n` 个节点的竞赛图（每对节点之间恰有一条有向边）中恰好有 `k` 个强连通分量的图的数量；对 $k=1,\dots,n$ 依次输出 `n` 个整数（空格分隔在同一行），均对 $10^9+7$ 取模。

**解题思路**：

- **观察**：竞赛图缩点后各强连通分量之间两两的边都同向，构成一个全序，故存在唯一的「源强连通分量」（其余分量都被它指向），可以按源分量做分治计数：选定源分量后，它指向其余所有分量的边方向随之确定，其余部分内部任意。

- **做法**：记 $w(x)=2^{x(x-1)/2}$ 为 $x$ 个标号点的竞赛图总数（代码用 `pw` 预计算 $2$ 的幂到 $n^2$，`ways` 取用）。先求 `scc[i]`——`i` 个点的强连通竞赛图数：总数 $w(i)$ 减去源分量大小 $s<i$ 的情形 $\binom{i}{s}scc[s]w(i-s)$，即 $scc[i]=w(i)-\sum_{s=1}^{i-1}\binom{i}{s}scc[s]w(i-s)$（选出源分量的顶点集合、其内部必须强连通、剩余任意）。再求 `f[i][k]`——`i` 个点恰有 `k` 个强连通分量的数量：按源分量大小 `s` 划分，$f[i][k]=\sum_{s=1}^{i}\binom{i}{s}scc[s]f[i-s][k-1]$，初值 `f[0][0] = 1`，组合数由杨辉三角预处理的 `C` 提供。最后输出 `f[n][1..n]`。

- **正确性**：每个非强连通竞赛图的源分量唯一，两个递推都按源分量的大小分类，故不重不漏；源分量与其余分量之间的边方向被源分量唯一确定，无需再乘方向数。总时间复杂度为 $O(n^3)$：求 `f[i][k]` 时 `i`、`k`、`s` 三重循环全要跑（$n = 500$ 时约 $4\times10^7$ 次取模）；空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;

void solve()
{
    int n;
    cin >> n;
    vector<vector<ll>> C(n + 1, vector<ll>(n + 1, 0));
    for (int i = 0; i <= n; i++)
    {
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; j++) C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD;
    }
    vector<ll> pw(n * n + 1, 1);
    for (int i = 1; i <= n * n; i++) pw[i] = pw[i - 1] * 2 % MOD;
    auto ways = [&](int x)
    { return pw[x * (x - 1) / 2]; };

    vector<ll> scc(n + 1, 0);
    scc[1] = 1;
    for (int i = 2; i <= n; i++)
    {
        ll total = ways(i);

        for (int s = 1; s < i; s++)
            total = (total - C[i][s] * scc[s] % MOD * ways(i - s) % MOD + MOD) % MOD;
        scc[i] = total;
    }

    vector<vector<ll>> f(n + 1, vector<ll>(n + 1, 0));
    f[0][0] = 1;
    for (int i = 1; i <= n; i++)
        for (int k = 1; k <= i; k++)
        {

            for (int s = 1; s <= i; s++)
            {
                f[i][k] = (f[i][k] + C[i][s] * scc[s] % MOD * f[i - s][k - 1]) % MOD;
            }
        }
    for (int k = 1; k <= n; k++) cout << f[n][k] << ' ';
    cout << '\n';
}
```

:::

### Collecting Numbers Distribution


**题目大意**：给定 `n`（$n \le 500$），统计 $1..n$ 的排列中「按值从小到大依次收集」恰好需要 `k` 轮才能收齐的排列数，对每个 $k=1..n$ 输出，对 $10^9+7$ 取模。收集规则：每轮从数组开头向右扫描一遍，遇到当前待收集的最小值时把它收下，一轮结束后进入下一轮继续。

**解题思路**：

- **观察**：记 $q_v$ 为值 $v$ 在排列中的位置（$q$ 即排列的逆排列）。值 $v$ 若出现在值 $v-1$ 的左边（$q_v<q_{v-1}$），本轮扫描已经越过它的位置，只能等下一轮，因此轮数 $=1+\#\{v\in[2,n]:q_v<q_{v-1}\}=1+\mathrm{des}(q)$，其中 $\mathrm{des}(q)$ 是 $q$ 的下落数（满足 $q_u>q_{u+1}$ 的 $u$ 的个数）。$q$ 随排列取遍 $1..n$ 的所有排列，所以恰需 `k` 轮的排列数就是欧拉数 $A(n,k-1)$。

- **做法**：`dp[j]` 从 $A(1,\cdot)$ 出发逐行推进到 $A(n,\cdot)$，递推 $A(m,j)=(j+1)A(m-1,j)+(m-j)A(m-1,j-1)$：插入最大元 `m` 时共有 `m` 个空隙，与原排列的某个下落同处一个空隙或放在末尾（共 `j+1` 种）不改变下落数，其余 $m-1-j$ 种使下落数加 1。最后依次输出 `dp[0..n-1]`，其中第 `k` 个即需要 `k` 轮的排列数。

- **正确性**：$q_v<q_{v-1}$ 的真假只由相邻两个值的相对位置决定，每出现一次就说明本轮已扫过值 $v$ 的位置；递推按插入最大元后的下落数变化精确计数。时间复杂度为 $O(n^2)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll MOD = 1e9 + 7;

void solve()
{
    int n;
    cin >> n;
    vector<ll> dp(n, 0);
    dp[0] = 1;
    for (int i = 2; i <= n; i++)
    {
        vector<ll> ndp(i, 0);
        for (int j = 0; j < i - 1; j++)
        {
            ndp[j] = (ndp[j] + dp[j] * (j + 1)) % MOD;
            ndp[j + 1] = (ndp[j + 1] + dp[j] * (i - 1 - j)) % MOD;
        }
        dp = ndp;
        dp.resize(i);
    }
    for (int j = 0; j < n; j++) cout << dp[j] << ' ';
    cout << '\n';
}
```

:::

### Functional Graph Distribution


**题目大意**：对每个 $k=1,\dots,n$，求 $n$ 个点的函数图（每点恰有一条出边）中恰好有 $k$ 个连通分量的个数，对 $10^9+7$ 取模（$n\le 5000$）。

**解题思路**：

- **连通函数图的计数**：一个连通函数图 = 恰一个环 + 环上挂的有根树。设 $g[s]$ 为 $s$ 个标号点的连通函数图数，则
  $$g[s]=\sum_{c=1}^{s}\binom{s}{c}(c-1)!\cdot c\cdot s^{\,s-c-1},$$
  其中 $c$ 是环长，$s^{s-c-1}\cdot c$ 是「以 $c$ 个指定点为根的有根森林」个数（广义 Cayley 公式）；$c=s$ 时指数为 $-1$，用模逆元算，结果为 $(s-1)!$，正好对应「一个 $s$-轮换」。
- **朴素 DP 太慢**：$dp[s][k]=\sum_a\binom{s-1}{a-1}g[a]\,dp[s-a][k-1]$ 是 $O(n^3)$，$n=5000$ 必超时。
- **拉格朗日反演**：设 $H(x)=\sum_{s\ge0}s^s x^s/s!$（所有函数图的 EGF），$G=\log H$（连通函数图的 EGF，变量代换后 $H=1/(1-T)$，$T=xe^T$ 是树函数，故 $G=-\log(1-T)$）。对 $G$ 的复合逆有闭式 $\varphi(u)=(1-e^{-u})e^{-(1-e^{-u})}$，于是由拉格朗日反演
  $$\text{dp}[n][k]=\frac{(n-1)!}{(k-1)!}\,[t^{\,n-k}]\,\psi(t)^n,\qquad \psi(t)=\frac{t\,e^{1-e^{-t}}}{1-e^{-t}}.$$
  只需算 $\psi$ 的 $n$ 次幂（一次 log + 一次 exp），整体时间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
const ll MOD = 1000000007LL;

ll pw(ll a, ll b)
{
    ll r = 1;
    a %= MOD;
    while (b > 0) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; }
    return r;
}

void solve()
{
    int n;
    cin >> n;
    int N = n + 1;
    vector<ll> fact(N, 1), invFact(N, 1), inv(N, 0);
    for (int i = 1; i < N; i++) fact[i] = fact[i - 1] * i % MOD;
    invFact[N - 1] = pw(fact[N - 1], MOD - 2);
    for (int i = N - 1; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;
    for (int i = 1; i < N; i++) inv[i] = fact[i - 1] * invFact[i] % MOD;

    // E(t) = 1 - e^{-t}，无常数项
    vector<ll> E(N, 0);
    for (int j = 1; j < N; j++) E[j] = (j & 1) ? invFact[j] : (MOD - invFact[j]) % MOD;
    // A = t/E = 1/Ehat, Ehat = E/t
    vector<ll> Ehat(N, 0);
    for (int j = 0; j + 1 < N; j++) Ehat[j] = E[j + 1];
    vector<ll> A(N, 0);
    A[0] = pw(Ehat[0], MOD - 2);
    for (int j = 1; j < N; j++)
    {
        ll s = 0;
        for (int i = 1; i <= j; i++) s = (s + Ehat[i] * A[j - i]) % MOD;
        A[j] = (MOD - s) % MOD * A[0] % MOD;
    }
    // B = exp(E)
    vector<ll> B(N, 0);
    B[0] = 1;
    for (int j = 1; j < N; j++)
    {
        ll s = 0;
        for (int i = 1; i <= j; i++) s = (s + (ll)i * E[i] % MOD * B[j - i]) % MOD;
        B[j] = s * inv[j] % MOD;
    }
    // psi = A * B
    vector<ll> psi(N, 0);
    for (int i = 0; i < N; i++)
    {
        if (!A[i]) continue;
        for (int j = 0; i + j < N; j++)
            if (B[j]) psi[i + j] = (psi[i + j] + A[i] * B[j]) % MOD;
    }
    // psi^n = exp(n * log psi)
    vector<ll> L(N, 0);
    for (int j = 1; j < N; j++)
    {
        ll s = 0;
        for (int i = 1; i < j; i++) s = (s + (ll)i * L[i] % MOD * psi[j - i]) % MOD;
        L[j] = (psi[j] - s * inv[j] % MOD + MOD) % MOD;
    }
    vector<ll> nL(N, 0);
    for (int j = 0; j < N; j++) nL[j] = L[j] * n % MOD;
    vector<ll> psiN(N, 0);
    psiN[0] = 1;
    for (int j = 1; j < N; j++)
    {
        ll s = 0;
        for (int i = 1; i <= j; i++) s = (s + (ll)i * nL[i] % MOD * psiN[j - i]) % MOD;
        psiN[j] = s * inv[j] % MOD;
    }

    for (int k = 1; k <= n; k++)
        cout << fact[n - 1] * invFact[k - 1] % MOD * psiN[n - k] % MOD << "\n";
}
```

:::
