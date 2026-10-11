---
title: "CSES 数据结构"
description: "本篇包含：Range Queries（25 题）、Tree Algorithms（16 题）、Sliding Window Problems（11 题）。共 52 题。"
pubDate: 2026-01-07T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/13.jpg"
---
本篇包含：Range Queries（25 题）、Tree Algorithms（16 题）、Sliding Window Problems（11 题）。共 52 题。



## Range Queries

### Static Range Sum Queries


**题目大意**：给定一个长度为 `n` 的静态数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次给出区间 `[l, r]`，求其中所有元素之和；询问之间不会修改数组。

**解题思路**：前缀和。读入后执行 `a[i] += a[i - 1]`，把 `a[i]` 变成前 `i` 个元素之和；区间 `[l, r]` 的和即 `a[r] - a[l - 1]`。数组静态、不需要支持修改，因此预处理一遍前缀和之后每次询问只做一次减法。预处理时间复杂度为 $O(n)$，每次询问的时间复杂度为 $O(1)$，总时间复杂度为 $O(n+q)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

ll n, m, a[N];
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= n; i++) a[i] += a[i - 1];
    while (m--) {
        int l, r;
        cin >> l >> r;
        cout << a[r] - a[l - 1] << '\n';
    }
}
```

:::

### Static Range Minimum Queries


**题目大意**：给定一个长度为 `n` 的静态数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次给出区间 `[l, r]`，求其中的最小值；询问之间不会修改数组。

**解题思路**：

- **做法（稀疏表）**：倍增预处理区间最小值：`a[i][j]` 表示从 `i` 开始、长度为 $2^j$ 的区间的最小值，满足
  $$
  a[i][j]=\min\bigl(a[i][j-1],a[i+2^{j-1}][j-1]\bigr).
  $$
  询问 `[l, r]` 时取 $s=\lfloor\log_2(r-l+1)\rfloor$，用 `[l, l+2^s-1]` 与 `[r-2^s+1, r]` 这两个长度 $2^s$ 的区间覆盖 `[l, r]`（允许重叠，最小值不受影响），答案为 `min(a[l][s], a[r - (1 << s) + 1][s])`。预处理时间复杂度为 $O(n\log n)$，每次询问的时间复杂度为 $O(1)$。

- **另解（离线）**：按右端点 `r` 把询问分组，从左到右扫描位置 `i`，用单调栈维护「尚未被右侧更小或相等元素取代」的位置：当 `a[st.top()] >= a[i]` 时弹出栈顶并 `s.merge(st.top(), i)`，让被弹出位置的并查集代表指向 `i`；弹出结束后把 `i` 压栈，再用 `a[s.get(ls[j])]` 回答挂在 `i` 上的询问 `j`。代表位置恰是 `[l, i]` 中最小值所在处：链上的每一跳都指向「更靠右且值不更大」的位置，而始终未被弹出的 `l` 说明 $(l,i]$ 内不存在比 $a[l]$ 更小的元素，此时代表就是 `l` 自身。每个位置至多入栈、出栈一次，总时间复杂度为 $O((n+q)\alpha(n))$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, m;
int a[N][21], logn[N];
void solve() {
    cin >> n >> m;
    memset(a, INF, sizeof(a));
    for (int i = 1; i <= n; i++) cin >> a[i][0];
    logn[1] = 0;
    logn[2] = 1;
    for (int i = 3; i <= n; i++) logn[i] = logn[i / 2] + 1;
    for (int j = 1; j <= 20; j++) {
        for (int i = 1; (i + (1 << j) - 1) <= n; i++)
            a[i][j] = min(a[i][j - 1], a[i + (1 << (j - 1))][j - 1]);
    }
    while (m--) {
        int l, r;
        cin >> l >> r;
        int s = logn[r - l + 1];
        cout << min(a[l][s], a[r - (1 << s) + 1][s]) << '\n';
    }
}
```

:::

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

struct dsu {
    int fa[N];
    void init(int n) {
        for (int i = 1; i <= n; i++) fa[i] = i;
    }
    int get(int x) { return x == fa[x] ? x : (fa[x] = get(fa[x])); }
    void merge(int x, int y) { fa[get(x)] = get(y); }
};
int n, q;
int a[N], ls[N], ans[N];
vector<int> rs[N];
dsu s;
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= q; i++) {
        int l, r;
        cin >> l >> r;
        rs[r].emplace_back(i);
        ls[i] = l;
    }
    s.init(n);
    stack<int> st;
    for (int i = 1; i <= n; i++) {
        while (st.size() && a[st.top()] >= a[i]) {
            s.merge(st.top(), i);
            st.pop();
        }
        st.push(i);
        for (auto j : rs[i]) {
            ans[j] = a[s.get(ls[j])];
        }
    }
    for (int i = 1; i <= q; i++) cout << ans[i] << '\n';
}
```

:::

### Dynamic Range Sum Queries


**题目大意**：维护一个长度为 `n` 的数组（$n, q \le 2 \times 10^5$），支持把位置 `k` 的值修改为 `u`，以及查询区间 `[l, r]` 的元素和。

**解题思路**：树状数组。修改操作读入的第二个参数（代码里变量名仍为 `r`）就是新值：位置 `l` 的旧值是 `sum(l) - sum(l - 1)`，所以只需向树状数组加入「新值 − 旧值」即 `r - sum(l) + sum(l - 1)`，之后所有前缀和自动跟着变，不必重建数组。区间 `[l, r]` 的和为 `sum(r) - sum(l - 1)`。预处理时间复杂度为 $O(n\log n)$，每次修改或查询的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 7;
int n, m;
ll BIT[N];
void add(int d, int v) {
    for (; d <= n; d += ((d) & -(d))) BIT[d] += v;
}
ll sum(int d) {
    ll res = 0;
    for (; d; d -= ((d) & -(d))) res += BIT[d];
    return res;
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        add(i, x);
    }
    while (m--) {
        int opt, l, r;
        cin >> opt >> l >> r;
        if (opt == 1)
            add(l, r - sum(l) + sum(l - 1));
        else
            cout << sum(r) - sum(l - 1) << '\n';
    }
}
```

:::

### Dynamic Range Minimum Queries


**题目大意**：维护一个长度为 `n` 的数组（$n, q \le 2 \times 10^5$），支持把位置 `k` 的值修改为 `u`，以及查询区间 `[l, r]` 的最小值。

**解题思路**：线段树（自底向上的写法）维护区间最小值。位置 `i` 对应叶子 `TREE_SIZE + i`（`TREE_SIZE = 1 << 18`）：`change(i, x)` 先把该叶子改成 `x`，再沿父链让每个祖先取两个孩子的最小值。`get_min(l, r)` 让 `l`、`r` 从叶子层同时上移：`l` 是右孩子（`l % 2 == 1`）时把 `tree[l]` 计入答案并令 `l` 右移一格，`r` 是左孩子（`r % 2 == 0`）时把 `tree[r]` 计入答案并令 `r` 左移一格，然后 `l`、`r` 各除以 2；这样取出的节点恰好不重不漏地覆盖 `[l, r]`。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int TREE_SIZE = 1 << 18;
int tree[TREE_SIZE * 2];

void change(int i, int x) {
    i += TREE_SIZE;
    tree[i] = x;
    while (i > 1) {
        i /= 2;
        tree[i] = min(tree[i * 2], tree[i * 2 + 1]);
    }
}

int get_min(int l, int r) {
    int res = (int)1e9;
    l += TREE_SIZE;
    r += TREE_SIZE;
    while (l <= r) {
        if (l % 2 == 1)
            res = min(res, tree[l++]);
        if (r % 2 == 0)
            res = min(res, tree[r--]);
        l /= 2;
        r /= 2;
    }
    return res;
}
void solve() {
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; ++i) {
        int x;
        cin >> x;
        change(i, x);
    }

    for (int qi = 0; qi < q; ++qi) {
        int t;
        cin >> t;
        if (t == 1) {
            int k, u;
            cin >> k >> u;
            change(k, u);
        } else {
            int l, r;
            cin >> l >> r;
            cout << get_min(l, r) << '\n';
        }
    }
}
```

:::

### Range Xor Queries


**题目大意**：给定一个长度为 `n` 的静态数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次给出区间 `[l, r]`，求其中所有元素的异或和。

**解题思路**：前缀异或。读入后执行 `a[i] ^= a[i - 1]`，使 `a[i]` 成为前 `i` 个元素的异或和；由 $x\oplus x=0$（同一个值异或两次相消），区间 `[l, r]` 的异或和为 `a[r] ^ a[l - 1]`。预处理时间复杂度为 $O(n)$，每次询问的时间复杂度为 $O(1)$，总时间复杂度为 $O(n+q)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, q;
int a[N];
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i], a[i] ^= a[i - 1];
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << (a[r] ^ a[l - 1]) << '\n';
    }
}
```

:::

### Range Update Queries


**题目大意**：维护一个长度为 `n` 的数组（$n, q \le 2 \times 10^5$），支持给区间 `[l, r]` 内的每个元素加上 `u`，以及查询位置 `k` 当前的值。

**解题思路**：

- **做法**：记差分数组 $b[i]=a[i]-a[i-1]$，则区间加等价于两个单点修改——$b[l]$ 加 `u`、$b[r+1]$ 减 `u`；而位置 `k` 的值正是差分的前缀和 $a[k]=\sum_{i\le k}b[i]$。于是本题只需要「单点加」与「前缀和查询」两个操作，用树状数组或线段树维护差分都可以，代码用线段树：初始化时对每个元素 `x` 执行 `change(i, x)` 与 `change(i + 1, -x)` 写出差分，区间加执行 `change(l, u)` 与 `change(r + 1, -u)`，询问位置 `k` 输出 `get_sum(1, k)`。每次操作的时间复杂度为 $O(\log n)$。

- **边界**：`get_sum(1, k)` 只会取出完全落在 `[1, k]`（$k \le n$）内的节点，因此 `r = n` 时 `change(n + 1, -u)` 写到的位置及其所有祖先都不会被任何询问读到，不需要特判。

:::details[题解(C++)]

```c++
const int TREE_SIZE = 1 << 18;
const int N = 2e5 + 7;
ll tree[TREE_SIZE * 2];

void change(int i, int x)
{
    i += TREE_SIZE;
    while (i)
    {
        tree[i] += x;
        i /= 2;
    }
}

ll get_sum(int l, int r)
{
    ll res = 0;
    l += TREE_SIZE;
    r += TREE_SIZE;
    while (l <= r)
    {
        if (l % 2 == 1) res += tree[l++];
        if (r % 2 == 0) res += tree[r--];
        l /= 2;
        r /= 2;
    }
    return res;
}

int n, q;
int a[N];
void solve()
{
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; ++i)
    {
        int x;
        cin >> x;
        change(i, x);
        change(i + 1, -x);
    }

    for (int qi = 0; qi < q; ++qi)
    {
        int t;
        cin >> t;
        if (t == 1)
        {
            int l, r, u;
            cin >> l >> r >> u;
            change(l, u);
            change(r + 1, -u);
        }
        else
        {
            int k;
            cin >> k;
            cout << get_sum(1, k) << '\n';
        }
    }
}
```

:::

### Forest Queries


**题目大意**：给定一个 $n\times n$ 的森林网格（$n \le 1000$，$q \le 2 \times 10^5$），其中 `*` 表示树、`.` 表示空地。回答 `q` 次矩形询问：求左上角为 `(l, r)`、右下角为 `(x, y)` 的矩形中有多少棵树；网格不会被修改。

**解题思路**：二维前缀和。`a[i][j]` 为矩形 `(1,1)` 到 `(i,j)` 内的树木数，按行列递推
$$
  a[i][j]=a[i][j-1]+a[i-1][j]-a[i-1][j-1]+\mathbf{1}[\text{格子}(i,j)\text{是树}].
$$
  矩形询问用容斥：减去左上角为 `(l, r)` 的矩形上方与左方的区域，再补回被多减一次的左上角，答案为 `a[x][y] + a[l-1][r-1] - a[x][r-1] - a[l-1][y]`。预处理时间复杂度为 $O(n^2)$，每次询问的时间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
char c;
int a[1001][1001];
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) cin >> c, a[i][j] = (c == '*');
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++)
            a[i][j] += a[i][j - 1] + a[i - 1][j] - a[i - 1][j - 1];
    }
    while (m--) {
        int l, r, x, y;
        cin >> l >> r >> x >> y;
        cout << a[x][y] + a[l - 1][r - 1] - a[x][r - 1] - a[l - 1][y] << '\n';
    }
}
```

:::

### Hotel Queries


**题目大意**：有 `n` 家酒店（$n, m \le 2 \times 10^5$），每家酒店有一定数量的空房。`m` 个团队依次到来，每个团队需要 `x` 间房：把团队安排到编号最小且空房数不少于 `x` 的酒店，并让该酒店的空房数减少 `x`；若不存在这样的酒店，则输出 0。

**解题思路**：

- **做法**：线段树维护区间最大空房数，叶子依次对应各酒店（叶子数取不小于 `n` 的最小二次幂，多出的叶子初值为 0）。若 `t[1] < x` 则没有任何酒店装得下，输出 0；否则 `query(x)` 从根 `k = 1` 向下走：左孩子的最大值不小于 `x` 就进入左孩子，否则进入右孩子，直到叶子，返回编号 `k - n + 1`；随后 `update(id, -x)` 把该叶子的空房数减去 `x` 并沿父链重算最大值。

- **正确性**：节点值就是它对应区间的最大空房数，因此「左孩子的最大值 $\ge x$」等价于左孩子那一段编号里存在可行的酒店，而左孩子覆盖的编号全部小于右孩子覆盖的编号（区间按编号从左到右切分），先试左孩子得到的必定是编号最小的可行酒店；每一步进入的孩子最大值仍 $\ge x$，所以不会走空。补齐的零值叶子永远不会被选中，因为 $x \ge 1$。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 1e6 + 5;

int n, m;
int t[N];
void update(int p, int val)
{
    for (t[p += n - 1] += val; p >= 1; p >>= 1) t[p >> 1] = max(t[p], t[p ^ 1]);
}
int query(int x)
{
    int k = 1;
    while (k < n)
    {
        if (t[2 * k] >= x)
            k *= 2;
        else
            k *= 2, k++;
    }
    return k - n + 1;
}
void solve()
{
    cin >> n >> m;
    int nn = n;
    int k = 1;
    for (; k < n;) k *= 2;
    n = k;
    for (int i = 0; i <= nn - 1; i++) cin >> t[i + n];
    for (int i = n - 1; i >= 1; i--) t[i] = max(t[i << 1], t[i << 1 | 1]);
    while (m--)
    {
        int x;
        cin >> x;
        if (t[1] >= x)
        {
            int id = query(x);
            cout << id << ' ';
            update(id, -x);
        }
        else
            cout << 0 << ' ';
    }
}
```

:::

### List Removals


**题目大意**：给定一个包含 `n` 个元素的列表（$n \le 2 \times 10^5$），再依次给出 `n` 个位置 `p`。每次删除当前列表中从左往右第 `p` 个元素，并输出被删除元素的值。

**解题思路**：

- **做法（线段树）**：线段树维护各原始位置的存活状态（1 存活、0 已删），节点值为区间内存活元素的个数。`query(k)` 从根向下找当前第 `k` 个存活元素：左子树的存活数不小于 `k` 就进入左子树，否则先把 `k` 减去左子树的存活数再进入右子树；到达叶子即得该元素的原下标 `pos`，输出 `x[pos]` 并 `change(pos, 0)` 删除。左子树的位置全部小于右子树，所以「左子树存活数 $\ge k$」说明第 `k` 个存活元素必在左子树，贪心下降定位正确；每次删除只把一条叶子到根的路径上的计数各减一。每次查找与删除的时间复杂度为 $O(\log n)$，总时间复杂度为 $O(n\log n)$。

- **另解（PBDS）**：顺序统计树用二元组 `(原位置, 元素值)` 保存未删元素——原位置互异，所以集合中的排序顺序就是列表顺序；`find_by_order(x - 1)` 取出当前第 `x` 个元素，输出它的值分量，再删除该元素。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

const int TREE_SIZE = 1 << 18;
int tree[TREE_SIZE * 2];

void change(int i, int x) {
    i += TREE_SIZE;
    tree[i] = x;
    while (i > 1) {
        i /= 2;
        tree[i] = tree[i * 2] + tree[i * 2 + 1];
    }
}
int query(int k) {
    int s = 1;
    while (s < TREE_SIZE) {
        if (tree[s * 2] >= k) {
            s = s * 2;
        } else {
            k -= tree[s * 2];
            s = s * 2 + 1;
        }
    }
    return s - TREE_SIZE;
}

int x[N];

void solve() {
    int n;
    cin >> n;

    for (int i = 1; i <= n; ++i) {
        cin >> x[i];
        change(i, 1);
    }

    for (int i = 1; i <= n; ++i) {
        int p;
        cin >> p;
        int pos = query(p);
        cout << x[pos] << ' ';
        change(pos, 0);
    }
    cout << '\n';
}
```

:::

:::details[题解(C++)]

```c++
typedef __gnu_pbds::tree<pair<int, int>, __gnu_pbds::null_type,
                         less<pair<int, int>>, __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    ordered_set;

ordered_set s;
void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        s.insert({i, x});
    }
    while (n--) {
        int x;
        cin >> x;
        cout << (*s.find_by_order(x - 1)).second << ' ';
        s.erase(s.find_by_order(x - 1));
    }
}
```

:::

### Salary Queries


**题目大意**：维护 `n` 名员工的工资（$n, q \le 2 \times 10^5$），支持修改员工 `k` 的工资，以及查询工资位于闭区间 `[l, r]` 内的员工人数。

**解题思路**：

- **做法（离散化 + 值域线段树）**：把可能出现过的工资收集起来排序去重——初始工资、每次查询的两个端点、每次修改后的新值（被改掉的旧值一定已经在初始工资里），再用 `index(x)`（即 `lower_bound`）把工资映射成离散下标；线段树的叶子记录各个工资值当前的人数。初始化后对每个员工执行 `change(index(p[i]), +1)`；修改员工 `qa[i]` 的工资时先 `change(index(p[qa[i]]), -1)`，再改掉 `p[qa[i]]` 并 `change(index(p[qa[i]]), +1)`；查询输出 `query(index(qa[i]), index(qb[i]))`。预处理时间复杂度为 $O((n+q)\log(n+q))$，每次操作的时间复杂度为 $O(\log(n+q))$。

- **另解（PBDS）**：顺序统计树维护全部工资（重复的工资各占一份），`order_of_key(r + 1) - order_of_key(l)` 即工资落在 $[l, r]$ 内的员工人数；修改时删除一份旧工资、插入新工资。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

const int TREE_SIZE = 1 << 20;
int tree[TREE_SIZE * 2];

void change(int i, int x) {
    i += TREE_SIZE;
    while (i > 0) {
        tree[i] += x;
        i /= 2;
    }
}

int query(int l, int r) {
    int sum = 0;
    l += TREE_SIZE;
    r += TREE_SIZE;
    while (l <= r) {
        if (l % 2 == 1)
            sum += tree[l++];
        if (r % 2 == 0)
            sum += tree[r--];
        l /= 2;
        r /= 2;
    }
    return sum;
}

int p[N];

char qt[N];
int qa[N], qb[N];

void solve() {
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; ++i) {
        cin >> p[i];
    }

    vector<int> values(p + 1, p + 1 + n);

    for (int i = 1; i <= q; ++i) {
        cin >> qt[i] >> qa[i] >> qb[i];
        if (qt[i] == '?') {
            values.push_back(qa[i]);
            values.push_back(qb[i]);
        } else {
            values.push_back(qb[i]);
        }
    }

    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());

    auto index = [&](int x) {
        return (int)(lower_bound(values.begin(), values.end(), x) -
                     values.begin());
    };

    for (int i = 1; i <= n; ++i) {
        change(index(p[i]), +1);
    }

    for (int i = 1; i <= q; ++i) {
        if (qt[i] == '?') {
            cout << query(index(qa[i]), index(qb[i])) << '\n';
        } else {
            change(index(p[qa[i]]), -1);
            p[qa[i]] = qb[i];
            change(index(p[qa[i]]), +1);
        }
    }
}
```

:::

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;
typedef __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
                         __gnu_pbds::rb_tree_tag,
                         __gnu_pbds::tree_order_statistics_node_update>
    oset;

int a[N];
oset s;
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i], s.insert(a[i]);
    while (m--) {
        char opt;
        int l, r;
        cin >> opt >> l >> r;
        if (opt == '?') {
            cout << s.order_of_key(r + 1) - s.order_of_key(l) << '\n';
        } else {
            s.erase(s.find_by_order(s.order_of_key(a[l])));
            a[l] = r;
            s.insert(r);
        }
    }
}
```

:::

### Prefix Sum Queries


**题目大意**：维护一个数组（$n, q \le 2 \times 10^5$），支持单点修改，并查询区间 `[l, r]` 的最大前缀和。允许选择空前缀，因此答案不会小于 0。

**解题思路**：

- **做法**：线段树每个节点存二元组（区间和, 最大前缀和），即 `first`、`second`。位置 `i` 存在下标 `i - 1`；叶子对应值 `x` 时该二元组为 `{x, max(x, 0)}`，下界 0 正对应允许空前缀。合并左区间 `x` 与右区间 `y` 时，最大前缀要么整段落在左区间（`x.second`），要么包含整个左区间再续上右区间的前缀（`x.first + y.second`），故 `combine` 返回 `{x.first + y.first, max(x.second, x.first + y.second)}`。

- **边界**：`combine` 不满足交换律（前缀方向固定），所以迭代查询时两侧要分别按序累积：左侧取出的节点依次 `resl = combine(resl, t[l++])`，右侧取出的节点依次 `resr = combine(t[--r], resr)`，最后取 `combine(resl, resr).second`；查询区间用左闭右开的 `[l - 1, r)`，`resl`、`resr` 的初值 `{0, 0}` 是空区间的单位元。每次修改或查询的时间复杂度为 $O(\log n)$，总时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, m;
pair<ll, ll> t[2 * N];

pair<ll, ll> combine(pair<ll, ll> x, pair<ll, ll> y) {
    return {x.first + y.first, max(x.second, x.first + y.second)};
}
void modify(int p, ll value) {
    for (t[p += n] = {value, max(value, 0ll)}; p >>= 1;)
        t[p] = combine(t[p << 1], t[p << 1 | 1]);
}

ll query(int l, int r) {
    pair<ll, ll> resl, resr;
    for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
        if (l & 1)
            resl = combine(resl, t[l++]);
        if (r & 1)
            resr = combine(t[--r], resr);
    }
    return combine(resl, resr).second;
}

void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        modify(i - 1, x);
    }
    while (m--) {
        int opt, l, r;
        cin >> opt >> l >> r;
        if (opt == 1) {
            modify(l - 1, r);
        } else {
            cout << query(l - 1, r) << '\n';
        }
    }
}
```

:::

### Pizzeria Queries


**题目大意**：有 `n` 家披萨店（$n, q \le 2 \times 10^5$），第 `i` 家店的披萨价格为 `a[i]`。从店 `i` 送到位置 `k` 的总花费为 $a[i]+|i-k|$。支持修改某家店的价格，以及查询送到位置 `k` 的最低总花费。

**解题思路**：

- **观察**：把 $a[i]+|i-k|$ 按店在位置 `k` 的哪一侧拆开：$i<k$ 时为 $(a[i]-i)+k$，$i>k$ 时为 $(a[i]+i)-k$，$i=k$ 时为 `a[k]`。于是只需两棵线段树，分别维护 `a[i] - i` 与 `a[i] + i` 的区间最小值。

- **做法**：店 `i` 存在线段树的下标 `i - 1`（线段树内部从 0 起算）。查询位置 `x` 时，左侧 `[0, x - 1)` 的最小值加 `x`、右侧 `[x, n)` 的最小值减 `x`，再与 `a[x]` 取最小（覆盖 $i=k$ 的情形）；修改价格时把 `a[k]` 改成新值并同步更新两棵树。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, m;
int a[N];
struct segtree {
    int t[2 * N];

    void modify(int p, int value) {
        for (t[p += n] = value; p > 1; p >>= 1) t[p >> 1] = min(t[p], t[p ^ 1]);
    }

    int query(int l, int r) {
        int res = 1e9;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if (l & 1)
                res = min(res, t[l++]);
            if (r & 1)
                res = min(res, t[--r]);
        }
        return res;
    }
};
segtree s, t;
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        s.modify(i - 1, a[i] - i);
        t.modify(i - 1, a[i] + i);
    }
    while (m--) {
        int opt;
        cin >> opt;
        if (opt == 1) {
            int k, x;
            cin >> k >> x;
            a[k] = x;
            s.modify(k - 1, a[k] - k);
            t.modify(k - 1, a[k] + k);
        } else {
            int x;
            cin >> x;
            cout << min(min(s.query(0, x - 1) + x, t.query(x, n) - x), a[x])
                 << '\n';
        }
    }
}
```

:::

### Visible Buildings Queries


**题目大意**：给定 `n` 栋楼的高度（$n \le 10^5$，$q \le 2 \times 10^5$）。每次询问一个区间 `[a, b]`：从位置 `a` 向右看，位置 `a` 的楼一定可见，之后一栋楼只有在高于此前所有可见楼时才可见。求区间内可见楼的数量。

**解题思路**：

- **观察**：从 `a` 向右看到的楼恰为 $a,\ next(a),\ next(next(a)),\ldots$，其中 $next(i)$ 是 `i` 右侧第一栋严格高于 `heights[i]` 的楼；这条链上的高度严格递增，可见楼数就是链上落在 `[a, b]` 内的位置个数。

- **做法**：在 `n + 1` 处放一栋高度 `INF` 的哨兵楼，保证任何位置都有后继。从右向左用单调栈求后继：弹出栈中所有高度不大于 `heights[i]` 的位置后，栈顶即 `jump[0][i]`。构造倍增表 `jump[k][i]` 表示从 `i` 连续跳 $2^k$ 次后继后的位置，转移为 `jump[k][i] = jump[k - 1][jump[k - 1][i]]`（代码取 $k \le 16$，17 层足以覆盖 $n \le 10^5$）。询问 `[a, b]` 时令 `pos = a`、答案初值为 1（计入 `a` 自身），从高位到低位尝试 `k`：若 `jump[k][pos] <= b`，说明这 $2^k$ 栋楼都落在区间内，答案累加 $2^k$ 并把 `pos` 移到 `jump[k][pos]`。

- **正确性**：链上位置递增，能被计入的跳转恰好是从 `a` 出发、仍不越过 `b` 的最大步数，从高位到低位的贪心能凑出它，所以累加值就是区间内的可见楼数。预处理时间复杂度为 $O(n\log n)$，每次询问的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 17;

void solve() {
    int n, q;
    cin >> n >> q;

    vector<int> heights(n + 2);
    for (int i = 1; i <= n; i++) {
        cin >> heights[i];
    }
    heights[n + 1] = INF;

    vector<vector<int>> jump(N, vector<int>(n + 2));
    jump[0][n + 1] = n + 1;

    vector<int> stack;
    stack.push_back(n + 1);
    for (int i = n; i >= 1; i--) {
        while (heights[stack.back()] <= heights[i]) {
            stack.pop_back();
        }
        jump[0][i] = stack.back();
        stack.push_back(i);
    }

    for (int k = 1; k < N; k++) {
        for (int i = 1; i <= n + 1; i++) {
            jump[k][i] = jump[k - 1][jump[k - 1][i]];
        }
    }

    while (q--) {
        int a, b;
        cin >> a >> b;
        int pos = a;
        int answer = 1;
        for (int k = N - 1; k >= 0; k--) {
            if (jump[k][pos] <= b) {
                answer += 1 << k;
                pos = jump[k][pos];
            }
        }
        cout << answer << "\n";
    }
}
```

:::

### Range Interval Queries


**题目大意**：给定一个静态数组（$n, q \le 2 \times 10^5$）。每次询问给出下标区间 `[a, b]` 和数值区间 `[c, d]`，求下标落在 `[a, b]` 且元素值落在 `[c, d]` 内的元素个数。

**解题思路**：

- **观察**：答案 = 值不大于 `d` 且在 `[a, b]` 内的元素数 − 值小于 `c` 且在 `[a, b]` 内的元素数，两部分都能离线按值域扫描完成。

- **做法**：数组元素记成事件 `{值, 2, 下标}`，每个询问拆成 `{c, 1, a, b, id}`（贡献取负）与 `{d, 3, a, b, id}`（贡献取正），按值升序、值相同时按类型 $1<2<3$ 排序处理。线段树维护已经加入的元素位置（`set_val(pos)` 把该位置置 1）。处理类型 1 的事件时，值等于 `c` 的元素还没被加入，`get_sum(a, b)` 正好是值小于 `c` 的个数，从该询问的答案里减去；处理类型 3 的事件时，值等于 `d` 的元素已经加入，`get_sum(a, b)` 正好是值不大于 `d` 的个数，加到答案里。

- **正确性**：同值事件「先扣、再插入、后加」的顺序保证两个边界都严格正确，两次统计相减得到的正是值在 $[c,d]$ 且下标在 `[a, b]` 内的元素数。预处理时间复杂度为 $O((n+q)\log(n+q))$，总时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

int tree[2 * N];

void set_val(int pos) {
    pos += N;
    tree[pos] = 1;

    for (pos /= 2; pos >= 1; pos /= 2) {
        tree[pos] = tree[2 * pos] + tree[2 * pos + 1];
    }
}

int get_sum(int a, int b) {
    a += N;
    b += N;

    int sum = 0;
    while (a <= b) {
        if (a % 2 == 1) {
            sum += tree[a++];
        }
        if (b % 2 == 0) {
            sum += tree[b--];
        }
        a /= 2;
        b /= 2;
    }
    return sum;
}

void solve() {
    int n, q;
    cin >> n >> q;

    vector<vector<int>> events;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        events.push_back({x, 2, i});
    }

    for (int i = 1; i <= q; i++) {
        int a, b, c, d;
        cin >> a >> b >> c >> d;
        events.push_back({c, 1, a, b, i});
        events.push_back({d, 3, a, b, i});
    }

    sort(events.begin(), events.end());

    vector<int> result(q + 1);

    for (auto event : events) {
        if (event[1] == 1) {
            int sum = get_sum(event[2], event[3]);
            result[event[4]] -= sum;
        }

        if (event[1] == 2) {
            set_val(event[2]);
        }

        if (event[1] == 3) {
            int sum = get_sum(event[2], event[3]);
            result[event[4]] += sum;
        }
    }

    for (int i = 1; i <= q; i++) {
        cout << result[i] << "\n";
    }
}
```

:::

### Subarray Sum Queries


**题目大意**：维护一个数组（$n, q \le 2 \times 10^5$），每次把一个位置修改为新值，并在修改后输出整个数组的最大子段和。允许选择空子段，因此答案至少为 0。

**解题思路**：线段树节点维护四个量：区间和 `val`、最大前缀和 `pre`、最大后缀和 `suf`、最大子段和 `t`。合并左、右子区间 $L$、$R$ 时
$$
  \begin{aligned}
  val &= val_L+val_R,\\
  pre &= \max(pre_L,val_L+pre_R),\\
  suf &= \max(suf_R,suf_L+val_R),\\
  t &= \max(t_L,t_R,suf_L+pre_R).
  \end{aligned}
$$
  最大子段要么全在左侧、要么全在右侧、要么跨中点（左区间的最大后缀接右区间的最大前缀）。叶子处 `pre`、`suf`、`t` 都取 `max(0ll, x)`，即允许空子段；`n` 之后的补齐叶子四项全为 0，正好是空段，与任何节点合并都不改变结果。`f(k, x)` 修改叶子后沿父链重算，根节点 `t[1]` 即答案。初始化和全部修改的总时间复杂度为 $O((n+m)\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

int n, m;
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
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        f(i, x);
    }
    while (m--) {
        ll k, x;
        cin >> k >> x;
        f(k, x);
        cout << t[1] << '\n';
    }
}
```

:::

### Subarray Sum Queries II


**题目大意**：给定一个静态数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次求区间 `[a, b]` 内的最大子段和。允许选择空子段，因此答案至少为 0。

**解题思路**：

- **做法**：线段树节点 `Node` 存 `total_sum`（区间和）、`max_left`（最大前缀和）、`max_right`（最大后缀和）、`max_sum`（最大子段和），叶子为 `{value, value, value, value}`。`combine` 把区间和相加；最大前缀取「全在左侧」与「整个左侧再接右侧前缀」的较大者，最大后缀对称；最大子段取左、右、跨中点（`left.max_right + right.max_left`）三者最大。

- **边界**：`combine` 不满足交换律，迭代查询必须保持左右顺序——左侧取出的节点依次用 `left = combine(left, tree[a++])` 接到已有区间的右边，右侧取出的节点依次用 `right = combine(tree[b--], right)` 接到已有区间的左边，最后 `combine(left, right)`。两个累积器的初值是零节点（`total_sum`、`max_left`、`max_right`、`max_sum` 全为 0），它相当于空区间，使结果按「允许空子段」取值、不小于 0。预处理时间复杂度为 $O(n\log n)$，每次询问的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

struct Node {
    ll total_sum, max_left, max_right, max_sum;
};

Node tree[2 * N];

Node combine(Node left, Node right) {
    Node result;
    result.total_sum = left.total_sum + right.total_sum;
    result.max_left = max(left.max_left, left.total_sum + right.max_left);
    result.max_right = max(right.max_right, left.max_right + right.total_sum);
    result.max_sum =
        max(max(left.max_sum, right.max_sum), left.max_right + right.max_left);
    return result;
}

void set_val(int pos, int value) {
    pos += N;
    tree[pos] = {value, value, value, value};

    for (pos /= 2; pos >= 1; pos /= 2) {
        tree[pos] = combine(tree[pos * 2], tree[pos * 2 + 1]);
    }
}

ll get_sum(int a, int b) {
    a += N;
    b += N;

    Node left = {}, right = {};
    while (a <= b) {
        if (a % 2 == 1) {
            left = combine(left, tree[a++]);
        }
        if (b % 2 == 0) {
            right = combine(tree[b--], right);
        }
        a /= 2;
        b /= 2;
    }

    return combine(left, right).max_sum;
}

void solve() {
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        set_val(i, x);
    }

    for (int i = 1; i <= q; i++) {
        int a, b;
        cin >> a >> b;
        cout << get_sum(a, b) << "\n";
    }
}
```

:::

### Distinct Values Queries


**题目大意**：给定一个静态数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次求区间 `[a, b]` 内不同数值的数量。

**解题思路**：

- **观察**：把「值 `v` 在所有大于等于 `l` 的出现位置中最靠左的那个」称为 `v` 在左端点 `l` 下的代表位置。一个值在 `[l, r]` 内出现过，当且仅当它的代表位置不大于 `r`；因此只要在线段树里把这些代表位置标记为 1，`query(l, r)` 的区间和就是 `[l, r]` 内不同值的个数。

- **做法**：询问按左端点 `l` 升序离线。`occurrences[v]` 从右向左收集值 `v` 的出现位置，向量末尾即最靠左者；初始把每个值最靠左的出现位置标记为 1。扫描左端点 `i`（从 0 起）：先回答所有 `l == i` 的询问，然后让位置 `i` 出局——若 `v[i]` 还有更靠后的出现位置，就把下一个出现位置标记为 1，它成为该值在新的左端点下的代表位置。

- **边界**：标记只置 1、不清 0；位置 `i` 退出统计靠的是询问左端点同步右移——`l = i` 及更靠左的标记都不会再被任何询问读到，所以不必撤销。每个位置至多被标记一次，每次修改与查询的时间复杂度为 $O(\log n)$，总时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int TREE_SIZE = 1 << 18;
int tree[TREE_SIZE * 2];

void change(int k, int x) {
    k += TREE_SIZE;
    tree[k] = x;
    while (k > 1) {
        k /= 2;
        tree[k] = tree[k * 2] + tree[k * 2 + 1];
    }
}

int query(int l, int r) {
    int ans = 0;
    l += TREE_SIZE;
    r += TREE_SIZE;
    while (l <= r) {
        if (l % 2 == 1)
            ans += tree[l++];
        if (r % 2 == 0)
            ans += tree[r--];
        l /= 2;
        r /= 2;
    }
    return ans;
}

struct Query {
    int l, r, i;
};
void solve() {
    int n, q;
    cin >> n >> q;

    vector<int> v(n);
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }

    map<int, vector<int>> occurrences;
    for (int i = n - 1; i >= 0; --i) {
        occurrences[v[i]].push_back(i);
    }

    for (auto& [v, l] : occurrences) {
        change(l.back(), 1);
        l.pop_back();
    }

    vector<Query> queries(q);
    for (int i = 0; i < q; ++i) {
        cin >> queries[i].l >> queries[i].r;
        queries[i].l--;
        queries[i].r--;
        queries[i].i = i;
    }

    sort(queries.begin(), queries.end(),
         [&](auto a, auto b) { return a.l < b.l; });

    vector<int> answer(q);

    for (int i = 0, j = 0; i < n; ++i) {
        while (j < q && queries[j].l == i) {
            answer[queries[j].i] = query(i, queries[j].r);
            ++j;
        }
        if (!occurrences[v[i]].empty()) {
            change(occurrences[v[i]].back(), 1);
            occurrences[v[i]].pop_back();
        }
    }

    for (int a : answer) {
        cout << a << ' ';
    }
    cout << '\n';
}
```

:::

### Distinct Values Queries II


**题目大意**：维护一个数组（$n, q \le 2 \times 10^5$），支持单点修改，以及判断区间 `[a, b]` 内的所有元素是否互不相同：没有重复值输出 `YES`，否则输出 `NO`。

**解题思路**：

- **观察**：区间 `[a, b]` 内无重复值，当且仅当其中每个位置的「下一个同值位置」都大于 `b`，也就是这些后继位置的最小值大于 `b`。

- **做法**：线段树在位置 `i` 存与 `values[i]` 同值的下一个位置（不存在记 `INF`，建树前先把整棵树填成 `INF`），询问 `[a, b]` 求区间最小值：不大于 `b` 输出 `NO`，否则输出 `YES`。有序集合 `pairs` 保存全部 `(值, 位置)` 二元组：`find_next` 用 `upper_bound({value, pos})` 找同值的下一个位置，`find_prev` 用 `lower_bound({value, pos})` 退一步找同值的上一个位置，均在 $O(\log n)$ 内完成。修改位置 `k` 为新值时，先从旧值链上摘掉它（旧前驱的后继直接改成旧后继），再挂到新值链上（新前驱的后继改成 `k`、`k` 的后继改成 `k` 之后的同值位置），因此每次只需改写常数个位置的值。

- **正确性**：维护的是「同值下一位置」的完整结构，查询条件与「区间内无重复值」等价。集合与线段树每次操作的时间复杂度为 $O(\log n)$，总时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

int tree[2 * N];

void set_val(int pos, int value) {
    pos += N;
    tree[pos] = value;
    for (pos /= 2; pos >= 1; pos /= 2) {
        tree[pos] = min(tree[2 * pos], tree[2 * pos + 1]);
    }
}

int get_min(int a, int b) {
    a += N;
    b += N;
    int result = tree[a];
    while (a <= b) {
        if (a % 2 == 1) {
            result = min(result, tree[a++]);
        }
        if (b % 2 == 0) {
            result = min(result, tree[b--]);
        }
        a /= 2;
        b /= 2;
    }
    return result;
}

set<pair<int, int>> pairs;

int find_next(int pos, int value) {
    auto it = pairs.upper_bound({value, pos});
    if (it == pairs.end() || it->first != value) {
        return INF;
    }
    return it->second;
}

int find_prev(int pos, int value) {
    auto it = pairs.lower_bound({value, pos});
    if (it == pairs.begin()) {
        return 0;
    }
    it--;
    if (it->first != value) {
        return 0;
    }
    return it->second;
}
void solve() {
    int n, q;
    cin >> n >> q;

    vector<int> values(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> values[i];
        pairs.insert({values[i], i});
    }

    for (int i = 1; i < 2 * N; i++) {
        tree[i] = INF;
    }

    for (int i = 1; i <= n; i++) {
        int next_pos = find_next(i, values[i]);
        set_val(i, next_pos);
    }

    while (q--) {
        int op;
        cin >> op;

        if (op == 1) {
            int k, u;
            cin >> k >> u;

            int prev_pos, next_pos;

            prev_pos = find_prev(k, values[k]);
            next_pos = find_next(k, values[k]);
            set_val(prev_pos, next_pos);
            pairs.erase({values[k], k});

            values[k] = u;

            prev_pos = find_prev(k, values[k]);
            set_val(prev_pos, k);
            next_pos = find_next(k, values[k]);
            set_val(k, next_pos);
            pairs.insert({values[k], k});
        }

        if (op == 2) {
            int a, b;
            cin >> a >> b;
            int pos = get_min(a, b);
            if (pos <= b) {
                cout << "NO\n";
            } else {
                cout << "YES\n";
            }
        }
    }
}
```

:::

### Increasing Array Queries


**题目大意**：给定一个数组（$n, q \le 2 \times 10^5$），回答 `q` 次询问：每次只考虑子数组 `[l, r]`，操作可以把某个元素加 1，求把该子数组变成不下降序列所需的最少操作次数。

**解题思路**：

- **观察**：操作只能加不能减，最优策略是从左到右把每个元素补到「它左边出现过的最大值」。固定左端点 `i` 时，把补平过程中创出新高（严格高于此前所有元素）的位置称为关键位置，则关键位置的下标递增、高度严格递增，相邻两个关键位置之间（不含右端）的元素全部被补到左端关键位置的高度。

- **做法**：询问按左端点分组，从右向左枚举 `i`。双端队列 `st` 维护从 `i` 出发的关键位置链（队首是下一个关键位置，哨兵 `a[n + 1] = INF` 保证它存在）；若 `a[i] >= a[st.front()]`，说明旧关键位置被 `a[i]` 覆盖，从树状数组里删掉它的代价并出队。设队首为下一个关键位置，则 `[i + 1, st.front() - 1]` 这一段全部补到 `a[i]` 的代价是 $v[i]=(st.front()-1-i)\cdot a[i]-(pre[st.front()-1]-pre[i])$，把它加入树状数组。回答询问 `[i, r]` 时用 `upper_bound` 找到最后一个不超过 `r` 的关键位置 `st[pos]`：它左侧的完整段代价由树状数组区间和给出（`query(st[pos - 1]) - query(i - 1)`），末尾的不完整段直接用前缀和算 $(r-st[pos])\cdot a[st[pos]]-(pre[r]-pre[st[pos]])$，两者相加即答案。

- **正确性**：关键位置链正是贪心补平后各「平台」的左端点，按段累加所有需要补的高度差，得到的就是最少操作次数。每个位置至多进队、出队一次，每次树状数组操作与二分为 $O(\log n)$，总时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

ll n, q;
ll a[N], pre[N], v[N], ans[N], BIT[N];
vector<pair<int, int>> que[N];
void add(int p, ll d) {
    for (; p <= n; p += ((p) & -(p))) {
        BIT[p] += d;
    }
}
ll query(int p) {
    ll sum = 0;
    for (; p; p -= ((p) & -(p))) {
        sum += BIT[p];
    }
    return sum;
}
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i], pre[i] = a[i] + pre[i - 1];
    a[n + 1] = INF, pre[n + 1] = pre[n] + a[n + 1];
    for (int i = 1; i <= q; i++) {
        int l, r;
        cin >> l >> r;
        que[l].emplace_back(r, i);
    }
    deque<int> st;
    st.push_back(n + 1);
    for (int i = n; i >= 1; i--) {
        while (!st.empty() and a[i] >= a[st.front()]) {
            add(st.front(), -v[st.front()]);
            st.pop_front();
        }
        v[i] = (st.front() - 1 - i) * a[i] - (pre[st.front() - 1] - pre[i]);
        add(i, v[i]);
        st.push_front(i);
        for (auto j : que[i]) {
            int pos =
                upper_bound(st.begin(), st.end(), j.first) - st.begin() - 1;
            ans[j.second] = (pos ? query(st[pos - 1]) - query(i - 1) : 0) +
                            (j.first - st[pos]) * a[st[pos]] -
                            (pre[j.first] - pre[st[pos]]);
        }
    }
    for (int i = 1; i <= q; i++) cout << ans[i] << '\n';
}
```

:::

### Movie Festival Queries


**题目大意**：有 `n` 部电影（$n \le 2 \times 10^5$），每部电影有开始时间 `a` 和结束时间 `b`（$a < b \le 10^6$）。每次询问给出时间段 `[a, b]`（$q \le 2 \times 10^5$），求在该时间段内最多能完整观看多少部互不重叠的电影；上一部结束的时刻不大于下一部开始的时刻即可连看。

**解题思路**：

- **观察**：单次询问用区间调度贪心：每一步都在当前能看（开始时间不小于当前时刻）的电影中选结束最早的那部。因为「能看的电影」只由当前时刻决定，这一步选择可以用 `nxt[i][0]` 描述——开始时间不小于 `i` 的电影中最早的结束时间，于是整个贪心过程是时间轴上的确定性跳转，可用倍增加速。

- **做法**：时间轴长度取 `M = 1000002`。先把同一开始时间的电影归并成最早的结束时间，再从右向左做后缀最小值得到 `nxt[i][0]`（没有任何可看的电影时记为哨兵 `M + 1`）；倍增表 `nxt[i][j]` 表示从时刻 `i` 连续贪心选 $2^j$ 部电影之后的时刻，转移为 `nxt[i][j] = nxt[nxt[i][j - 1]][j - 1]`。询问 `[a, b]` 从高位到低位尝试 `j`：若 `nxt[a][j] <= b`，说明这 $2^j$ 部电影都能在该时间段内看完，累加 $2^j$ 并把 `a` 更新为 `nxt[a][j]`。

- **正确性**：每一次跳转都只在结束时刻不超过 `b` 时被采用，累加的段数就是从 `a` 出发能完成的最大电影数所对应的贪心步数，而区间调度贪心本身最优。预处理时间复杂度为 $O(M\log M+n)$，每次询问的时间复杂度为 $O(\log M)$。

:::details[题解(C++)]

```c++
const int M = 1000002;
const int LOG_M = __lg(M);

int nxt[M + 2][LOG_M + 1];

void solve() {
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= M + 1; ++i) {
        nxt[i][0] = M + 1;
    }

    for (int i = 0; i < n; ++i) {
        int a, b;
        cin >> a >> b;
        nxt[a][0] = min(nxt[a][0], b);
    }

    for (int i = M - 1; i > 0; --i) {
        nxt[i][0] = min(nxt[i][0], nxt[i + 1][0]);
    }

    for (int j = 1; j <= LOG_M; ++j) {
        for (int i = 1; i <= M + 1; ++i) {
            nxt[i][j] = nxt[nxt[i][j - 1]][j - 1];
        }
    }

    for (int qi = 0; qi < q; ++qi) {
        int a, b;
        cin >> a >> b;
        int ans = 0;
        for (int j = LOG_M; j >= 0; --j) {
            if (nxt[a][j] <= b) {
                ans += 1 << j;
                a = nxt[a][j];
            }
        }
        cout << ans << '\n';
    }
}
```

:::

### Forest Queries II


**题目大意**：维护一个 $n\times n$ 的森林网格（$n \le 1000$，$q \le 2 \times 10^5$），支持翻转某个格子的状态（树与空地互换），以及查询任意矩形内的树木数量。

**解题思路**：二维树状数组。`add(x, y, v)` 做单点加，`sum(x, y)` 返回 `(1,1)` 到 `(x,y)` 矩形内的树木数，两者都是 $O(\log^2 n)$。初始化时对每个树格执行 `add(i, j, 1)`。翻转 `(x, y)` 前先用四项容斥求该格当前的值：`sum(x,y) - sum(x,y-1) - sum(x-1,y) + sum(x-1,y-1)`，等于 1 就加 `-1`（砍树），否则加 1（种树）。矩形询问同样容斥：行在 `[x, l]`、列在 `[y, r]` 内的树木数为 `sum(l,r) - sum(l,y-1) - sum(x-1,r) + sum(x-1,y-1)`。每次更新和查询的时间复杂度为 $O(\log^2 n)$。

:::details[题解(C++)]

```c++
int n, m;
struct BIT {
    ll t[1005][1005];
    void add(int x, int y, int v) {
        int z = y;
        while (x <= n) {
            y = z;
            while (y <= n) t[x][y] += v, y += ((y) & -(y));
            x += ((x) & -(x));
        }
    }
    ll sum(int x, int y) {
        ll res = 0;
        int z = y;
        while (x) {
            y = z;
            while (y) res += t[x][y], y -= ((y) & -(y));
            x -= ((x) & -(x));
        }
        return res;
    }
};
BIT t;
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            char c;
            cin >> c;
            if (c == '*')
                t.add(i, j, 1);
        }
    }
    while (m--) {
        int opt;
        cin >> opt;
        if (opt == 1) {
            int x, y;
            cin >> x >> y;
            if (t.sum(x, y) - t.sum(x, y - 1) - t.sum(x - 1, y) +
                    t.sum(x - 1, y - 1) ==
                1)
                t.add(x, y, -1);
            else
                t.add(x, y, 1);
        } else {
            int x, y, l, r;
            cin >> x >> y >> l >> r;
            cout << t.sum(l, r) - t.sum(l, y - 1) - t.sum(x - 1, r) +
                        t.sum(x - 1, y - 1)
                 << '\n';
        }
    }
}
```

:::

### Range Updates and Sums


**题目大意**：维护一个数组（$n, q \le 2 \times 10^5$），支持三种操作：把区间 `[l, r]` 的每个元素加上 `x`、把区间 `[l, r]` 的每个元素赋值为 `x`、查询区间 `[l, r]` 的元素和。

**解题思路**：

- **做法**：懒标记线段树，每个节点存区间和 `sum`、加法标记 `lazy_inc`、赋值标记 `has_rev` 与赋值内容 `rev_val`。`increase(rt, v)` 给整段加 `v`：`sum += len * v` 并累加 `lazy_inc`；`revise(rt, v)` 给整段赋值：`sum = len * v`、置上 `has_rev` 并清空 `lazy_inc`（此前的加法已被这次赋值覆盖）。`pushdown` 把标记传给两个孩子并清除父节点的标记；递归修改与查询时区间不相交直接返回、完全覆盖就地更新，否则先 `pushdown` 再递归，返回前 `pushup` 合并。代码还维护了 `Max`、`Min`，本题只用 `sum`。

- **边界**：两种标记并存时先后关系不能颠倒——赋值一定发生在更早的加法之后，所以 `pushdown` 必须先下传赋值、再下传加法（孩子先被整体覆盖，再叠加增量）。每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 1 << 18;

struct segment {
    int l;
    int r;

    ll sum;
    ll lazy_inc;

    ll Max;
    ll Min;

    bool has_rev;
    ll rev_val;
} tr[N << 2];

void increase(int rt, ll v) {
    int len = tr[rt].r - tr[rt].l + 1;

    tr[rt].sum += 1LL * len * v;
    tr[rt].Max += v;
    tr[rt].Min += v;

    tr[rt].lazy_inc += v;
}

void revise(int rt, ll v) {
    int len = tr[rt].r - tr[rt].l + 1;

    tr[rt].sum = 1LL * len * v;
    tr[rt].Max = v;
    tr[rt].Min = v;

    tr[rt].has_rev = true;
    tr[rt].rev_val = v;

    tr[rt].lazy_inc = 0;
}

void pushdown(int rt) {
    if (tr[rt].has_rev) {
        revise(rt << 1, tr[rt].rev_val);
        revise(rt << 1 | 1, tr[rt].rev_val);

        tr[rt].has_rev = false;
    }

    if (tr[rt].lazy_inc) {
        increase(rt << 1, tr[rt].lazy_inc);
        increase(rt << 1 | 1, tr[rt].lazy_inc);

        tr[rt].lazy_inc = 0;
    }
}

void pushup(int rt) {
    tr[rt].sum = tr[rt << 1].sum + tr[rt << 1 | 1].sum;
    tr[rt].Max = max(tr[rt << 1].Max, tr[rt << 1 | 1].Max);
    tr[rt].Min = min(tr[rt << 1].Min, tr[rt << 1 | 1].Min);
}

void build(int rt, int l, int r) {
    tr[rt].l = l;
    tr[rt].r = r;

    tr[rt].lazy_inc = 0;
    tr[rt].has_rev = false;

    if (l == r) {
        tr[rt].sum = 0;
        tr[rt].Max = 0;
        tr[rt].Min = 0;
        return;
    }

    int mid = (l + r) >> 1;

    build(rt << 1, l, mid);
    build(rt << 1 | 1, mid + 1, r);

    pushup(rt);
}

void modify(int rt, int l, int r, ll v) {
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

void add(int rt, int l, int r, ll v) {
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

ll get_Min(int rt, int l, int r) {
    if (l > tr[rt].r || tr[rt].l > r)
        return INFLL;

    if (l <= tr[rt].l && tr[rt].r <= r)
        return tr[rt].Min;

    pushdown(rt);

    return min(get_Min(rt << 1, l, r), get_Min(rt << 1 | 1, l, r));
}

ll get_Max(int rt, int l, int r) {
    if (l > tr[rt].r || tr[rt].l > r)
        return -INFLL;

    if (l <= tr[rt].l && tr[rt].r <= r)
        return tr[rt].Max;

    pushdown(rt);

    return max(get_Max(rt << 1, l, r), get_Max(rt << 1 | 1, l, r));
}

ll get_sum(int rt, int l, int r) {
    if (l > tr[rt].r || tr[rt].l > r)
        return 0;

    if (l <= tr[rt].l && tr[rt].r <= r)
        return tr[rt].sum;

    pushdown(rt);

    return get_sum(rt << 1, l, r) + get_sum(rt << 1 | 1, l, r);
}
int n, m;
int a[N];
void solve() {
    cin >> n >> m;
    build(1, 1, n);
    for (int i = 1; i <= n; i++) cin >> a[i], add(1, i, i, a[i]);
    while (m--) {
        int opt;
        cin >> opt;
        if (opt == 1) {
            int l, r, x;
            cin >> l >> r >> x;
            add(1, l, r, x);
        } else if (opt == 2) {
            int l, r, x;
            cin >> l >> r >> x;
            modify(1, l, r, x);
        } else {
            int l, r;
            cin >> l >> r;
            cout << get_sum(1, l, r) << '\n';
        }
    }
}
```

:::

### Polynomial Queries


**题目大意**：维护一个数组（$n, q \le 2 \times 10^5$），支持两种操作：对区间 `[l, r]` 依次加上 $1,2,3,\ldots,r-l+1$，以及查询区间 `[l, r]` 的元素和。

**解题思路**：

- **观察**：给区间 `[l, r]` 依次加 $1,2,\ldots,r-l+1$，等价于给位置 `x` 加 $x-l+1$，是关于 `x` 的一次函数；只要能把「一次函数形式的区间加」拆成少数几次带线性函数的后缀加，就不必逐点更新。

- **做法**：三棵树状数组分别记录常数项、一次项与二次项系数。`modify(x, i, j)` 在下标 `x + 1` 处写入四个量（`add(2, x + 1, -i)`、`add(0, x + 1, i * x * (x + 1) / 2)`、`add(1, x + 1, -j)`、`add(0, x + 1, x * j)`），它的效果是对每个位置 $k \ge x+1$ 加上 $-i\cdot k-j$、对 $k \le x$ 不加。于是区间 `[l, r]` 的更新由 `modify(r, 1, 1 - l)` 与 `modify(l - 1, -1, l - 1)` 合成：前者在 $k \ge r+1$ 上留下 $-k+l-1$，后者在 $k \ge l$ 上留下 $k-l+1$，两者在 $k > r$ 处恰好相消，只有 `[l, r]` 内的元素被加上 $k-l+1$。`query(x)` 把三个累计量记为 `a`、`b`、`c` 后返回 `a + b * x + c * x * (x + 1) / 2`（利用 $\sum_{k=1}^{x}k=\frac{x(x+1)}{2}$），即 $[1, x]$ 的元素和；区间 `[l, r]` 的和为 `query(r) - query(l - 1)`。

- **正确性**：位置 `k` 被两次调用累计加上的值恰为 $k-l+1$（当 $l \le k \le r$）或 0（当 $k$ 在区间外），与题目要求的区间加法一致。每次更新与查询只做常数次树状数组操作，每次操作的时间复杂度为 $O(\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;
ll n, q;
ll BIT[3][N];
void add(int id, int x, ll val) {
    for (; x <= n; x += ((x) & -(x))) {
        BIT[id][x] += val;
    }
}
void modify(ll x, int i, int j) {
    add(2, x + 1, -i);
    add(0, x + 1, i * x * (x + 1) / 2);
    add(1, x + 1, -j);
    add(0, x + 1, x * j);
}
ll query(int x) {
    ll a = 0, b = 0, c = 0;
    for (int i = x; i; i -= ((i) & -(i))) {
        a += BIT[0][i];
        b += BIT[1][i];
        c += BIT[2][i];
    }
    a += b * x;
    a += c * x * (x + 1) / 2;
    return a;
}
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        ll x;
        cin >> x;
        add(0, i, x);
    }
    while (q--) {
        int opt, l, r;
        cin >> opt >> l >> r;
        if (opt == 1) {
            modify(r, 1, 1 - l);
            modify(l - 1, -1, l - 1);
        } else {
            ll ans = query(r) - query(l - 1);
            cout << ans << '\n';
        }
    }
}
```

:::

### Range Queries and Copies


**题目大意**：维护若干个数组（$n, q \le 2 \times 10^5$），初始只有一个数组。支持修改指定数组 `k` 的某个位置、查询指定数组 `k` 的区间和，以及复制数组 `k` 并把副本作为新的数组加入集合。

**解题思路**：

- **观察**：各个版本共享绝大部分数据，用可持久化线段树最合适：单点修改只新建「从根到叶子」路径上的节点，其余节点与旧版本共享，于是复制与修改都能在 $O(\log n)$ 内完成。

- **做法**：`Node` 存左右孩子指针与区间和 `sum`，`trees[k]` 是第 `k` 个数组的根。`change` 先用 `new Node(*p)` 复制当前节点，只对包含目标位置的一侧递归重建，另一侧继续共享旧节点，最后让 `trees[k]` 指向新根。复制数组只需 `trees.push_back(trees[k])`——两个版本暂时共享根，之后的修改会通过路径复制自动分离。区间查询 `query(trees[k], 0, n, l - 1, r)` 在指定根上按半开区间 `[l - 1, r)` 递归求和。

- **正确性**：路径复制保证旧版本的节点永远不会被改写，各版本互不干扰。每次操作的时间复杂度为 $O(\log n)$，总空间复杂度为 $O(n+q\log n)$。

:::details[题解(C++)]

```c++
struct Node {
    Node *left = nullptr, *right = nullptr;
    ll sum;
};

Node* build(int l, int r, vector<int>& v) {
    Node* p = new Node();
    if (r - l == 1) {
        p->sum = v[l];
    } else {
        int m = (l + r) / 2;
        p->left = build(l, m, v);
        p->right = build(m, r, v);
        p->sum = p->left->sum + p->right->sum;
    }
    return p;
}

Node* change(Node* p, int l, int r, int k, int x) {
    Node* n = new Node(*p);
    if (r - l == 1) {
        n->sum = x;
    } else {
        int m = (l + r) / 2;
        if (k < m) {
            n->left = change(p->left, l, m, k, x);
        } else {
            n->right = change(p->right, m, r, k, x);
        }
        n->sum = n->left->sum + n->right->sum;
    }
    return n;
}

ll query(Node* p, int l, int r, int ql, int qr) {
    if (qr <= l || r <= ql)
        return 0;
    if (ql <= l && r <= qr)
        return p->sum;
    int m = (l + r) / 2;
    return query(p->left, l, m, ql, qr) + query(p->right, m, r, ql, qr);
}

void solve() {
    int n, q;
    cin >> n >> q;

    vector<int> v(n);
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }

    vector<Node*> trees{build(0, n, v)};

    for (int qi = 0; qi < q; ++qi) {
        int t, k;
        cin >> t >> k;
        k--;
        if (t == 1) {
            int a, x;
            cin >> a >> x;
            trees[k] = change(trees[k], 0, n, a - 1, x);
        } else if (t == 2) {
            int l, r;
            cin >> l >> r;
            cout << query(trees[k], 0, n, l - 1, r) << '\n';
        } else {
            trees.push_back(trees[k]);
        }
    }
}
```

:::

### Missing Coin Sum Queries


**题目大意**：给定 `n` 枚硬币（$n, q \le 2 \times 10^5$），第 `i` 枚硬币的面值为 `c[i]`。每次询问只允许使用下标位于 `[l, r]` 的硬币，每枚硬币最多使用一次，求无法凑出的最小正整数金额。

**解题思路**：

- **观察**：设当前已经能凑出 $[1, res]$：若下一枚硬币的面值不大于 $res+1$，可凑区间就扩展为 $[1, res+coin]$；否则 $res+1$ 无法凑出。把硬币按最高二进制位 `id = __lg(c[i])` 分组后，第 `id` 组的面值都落在 $[2^{id}, 2^{id+1})$ 内，从低位组向高位组处理时，只要 $res+1$ 不小于该组的最小面值，整组都能并入（并入第一枚后 $res+1$ 已不小于 $2^{id+1}$，超过组内任意面值），因此每组只需要「区间内该组的最小面值」与「区间内该组的面值总和」两个信息。

- **做法**：询问按右端点离线，从左到右扫描右端点 `i`。每个 `id` 用单调栈维护后缀最小值候选：新位置的值更小时，被弹出位置的并查集父节点指向新位置，于是 `get(id, ls[k])` 给出区间 `[ls[k], i]` 内该组最小值所在的位置；`t[i][id]` 是每组的前缀和，可以 $O(1)$ 求出区间总和（该组在区间内没有硬币时最小值为 `INF`，代码折算成 0，使 $res+1\ge 0$ 必然成立、该组贡献 0 后继续下一组）。回答询问时按 `id` 升序：若 $res+1$ 不小于该组的最小值，就把该组的区间总和累加进 `res`，否则停下并输出 $res+1$。

- **正确性**：组内硬币按升序并入时，每枚并入前都满足 $res+1$ 不小于它的面值——首枚由最小值条件保证，其后每一枚之前都至少已并入过一枚不小于 $2^{id}$ 的硬币；而当该组最小值已经大于 $res+1$ 时，这个金额就凑不出来。总时间复杂度为 $O((n+q)\log C)$，其中 $C$ 为面值上限。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

const int logC = 29;
int n, q;
int c[N], a[N][logC + 1], ls[N], fa[N][logC + 1];
ll t[N][logC + 1], ans[N];
vector<int> rs[N];
stack<int> st[logC + 1];
int get(int id, int x) {
    return x == fa[x][id] ? x : (fa[x][id] = get(id, fa[x][id]));
}

void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        cin >> c[i];
        int id = __lg(c[i]);
        a[i][id] = c[i];
        t[i][id] = c[i];
    }
    for (int id = 0; id <= logC; id++) {
        for (int i = 1; i <= n; i++) {
            a[i][id] = (a[i][id] == 0 ? INF : a[i][id]);
            t[i][id] += t[i - 1][id];
            fa[i][id] = i;
        }
    }
    for (int i = 1; i <= q; i++) {
        int l, r;
        cin >> l >> r;
        rs[r].emplace_back(i);
        ls[i] = l;
    }
    for (int i = 1; i <= n; i++) {
        for (int id = 0; id <= logC; id++) {
            while (st[id].size() && a[st[id].top()][id] >= a[i][id]) {
                fa[st[id].top()][id] = i;
                st[id].pop();
            }
            st[id].push(i);
        }
        for (auto k : rs[i]) {
            ll res = 0;
            for (int id = 0; id <= logC; id++) {
                int minn = a[get(id, ls[k])][id];
                if (minn == INF)
                    minn = 0;
                if (res + 1 >= minn) {
                    res += t[i][id] - t[ls[k] - 1][id];
                } else
                    break;
            }
            ans[k] = res + 1;
        }
    }
    for (int i = 1; i <= q; i++) cout << ans[i] << '\n';
}
```

:::

## Tree Algorithms

### Subordinates


**题目大意**：公司层级构成一棵以 1 号员工为根的树：输入员工数 `n`（$n \le 2 \times 10^5$）以及 2 至 `n` 号员工各自的直接上级。对每名员工，求其所有直接和间接下属的数量并依次输出。

**解题思路**：后序 DFS 统计子树大小。进入 `u` 时 `sz[u]++`（计入自身），递归完孩子 `v` 后累加 `sz[v]`；DFS 结束后 `sz[u]` 即以 `u` 为根的子树节点数，答案输出 `sz[u] - 1`（减去自己）。叶子的 `sz[u] = 1`，答案为 0；DFS 以父节点参数 `fa` 跳过回边，每条边访问两次。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, sz[N];
vector<int> G[N];
void dfs(int u, int fa) {
    sz[u]++;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dfs(v, u);
        sz[u] += sz[v];
    }
}
void solve() {
    cin >> n;
    for (int i = 2; i <= n; i++) {
        int x;
        cin >> x;
        G[x].emplace_back(i);
        G[i].emplace_back(x);
    }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) cout << sz[i] - 1 << ' ';
}
```

:::

### Tree Matching


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，求最多能选出多少条两两没有公共端点的边。

**解题思路**：

- **观察**：每条被选中的边占用两个端点，故任意节点至多与一个孩子相连。对每个节点 `node` 维护两个状态：`dp[0]` 为 `node` 不与任何孩子匹配时其子树内的最大匹配数，`dp[1]` 为 `node` 至多与一个孩子匹配时的最大匹配数。

- **做法**：按孩子逐个合并。不选边 `(node, child)` 时两端各自取最优，故 `dp[0] += max(child_dp[0], child_dp[1])`，`dp[1]` 同样累加 `max(child_dp[0], child_dp[1])`；选边时 `node` 此前不能与其他孩子匹配过、`child` 也不能与自己的孩子匹配，候选值为 `dp[0] + child_dp[0] + 1`，其中 `+1` 即边 `(node, child)` 本身。代码把三种候选写进一次赋值：`dp[1] = max({dp[0] + child_dp[0] + 1, dp[1] + child_dp[1], dp[1] + child_dp[0]})`。

- **正确性**：每个孩子仅在合并进 `node` 时被考虑一次，`dp[0]` 与 `dp[1]` 分别覆盖了「不选孩子边」与「不选或恰选一条孩子边」的全部情况，故不漏解也不重复计数。叶子没有孩子，`dp[0] = dp[1] = 0`；根节点允许匹配也可不匹配，答案为 `max(result[0], result[1])`，其中 `result` 是 `dfs(1, 1)` 的返回值（以自身为父节点参数）。

- **边界**：`max({...})` 的三个候选在整条赋值语句求值完成后才写入 `dp[1]`，其中的 `dp[0]`、`dp[1]` 都是本孩子合并前的旧值，因此无需手动保存。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> g[N];

array<int, 2> dfs(int node, int parent) {
    auto dp = array{0, 0};
    for (int child : g[node]) {
        if (child == parent)
            continue;
        auto child_dp = dfs(child, node);
        dp[1] = max({dp[0] + child_dp[0] + 1, dp[1] + child_dp[1],
                     dp[1] + child_dp[0]});
        dp[0] += max(child_dp[0], child_dp[1]);
    }
    return dp;
}

void solve() {
    int n;
    cin >> n;

    for (int i = 0; i < n - 1; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    auto result = dfs(1, 1);

    cout << max(result[0], result[1]) << '\n';
}
```

:::

### Tree Diameter


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，求树上任意两节点间距离的最大值，即树的直径长度；距离按路径包含的边数计算。

**解题思路**：

- **做法**：两次 DFS。第一次从 1 出发，`dep[u]` 记录起点到 `u` 的距离，全局 `c` 记录当前最远节点；第二次把 `dep[c]` 置 0 后从 `c` 出发，再次取最远距离 `dep[c]` 即直径。单节点树不进入任何边，`c` 与 `dep[c]` 保持初值 0，输出 0 正确。

- **正确性**：需证从任意节点 `u` 出发的最远点 `v` 必为某条直径的端点。任取直径 $(a,b)$，以 `u` 为根设 $x$ 为 `a`、`b` 的 LCA。若 `u→v` 的路径经过 $x$：由 $d(u,v) \ge d(u,a)$ 得 $d(x,v) \ge d(x,a)$，故 $d(v,b) = d(v,x) + d(x,b) \ge d(a,b)$，$(v,b)$ 也是直径。若 `u→v` 与 `u→a` 在 `u→x` 上的点 `z` 处分叉（此时 $d(z,x) > 0$）：由最远性 $d(z,v) \ge d(z,a) = d(z,x) + d(x,a)$，得 $d(v,b) = d(v,z) + d(z,x) + d(x,b) \ge d(a,b) + 2d(z,x) > d(a,b)$，与 $(a,b)$ 是直径矛盾，故该情形不可能。因此 `v` 必为某条直径的端点：第一次 DFS 得到的 `c` 是直径端点，第二次 DFS 的最大距离即直径。总时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, c, dep[N];
vector<int> G[N];
void dfs(int u, int fa) {
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dep[v] = dep[u] + 1;
        if (dep[v] > dep[c])
            c = v;
        dfs(v, u);
    }
}
void solve() {
    cin >> n;
    for (int i = 2; i <= n; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs(1, 0);
    dep[c] = 0;
    dfs(c, 0);
    cout << dep[c] << '\n';
}
```

:::

### Tree Distances I


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，对每个节点求它到其他节点的最大距离并依次输出。

**解题思路**：

- **观察**：节点 `u` 的最远点要么在 `u` 的子树内，要么在子树外；子树内的部分可自底向上算出，子树外的部分需由父节点方向下传。

- **做法**：`max_dist[u][0]`、`max_dist[u][1]` 分别保存从 `u` 出发的最大、次大距离，`update(node, offer)` 按大小把候选值插入这两个位置，只保留前二大。`dfs1` 自底向上，每个孩子 `v` 提交的候选为 `max_dist[v][0] + 1`。`dfs2` 自顶向下换根：对孩子 `child`，若 `max_dist[node][0] == max_dist[child][0] + 1`（父节点的最大值恰由该孩子贡献），则不能原路返回，改用次大值提交 `max_dist[node][1] + 1`，否则提交 `max_dist[node][0] + 1`。两遍 DFS 后 `max_dist[i][0]` 已覆盖子树内与子树外两个方向，即为答案。

- **边界**：多个孩子贡献相同的最大值时，`update` 会把相等的另一份存入次大位置（第二份相等候选仍满足 `offer > max_dist[node][1]`），因此 `dfs2` 取次大值传回不会把当前孩子自身的方向重复计入。`dfs1(1, 1)`、`dfs2(1, 1)` 都以自身为父节点参数，跳过父节点的判断对根自然成立；叶子没有孩子，其 `max_dist` 两项保持 0。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> g[N];
int max_dist[N][2];

void update(int node, int offer) {
    if (offer > max_dist[node][0]) {
        max_dist[node][1] = max_dist[node][0];
        max_dist[node][0] = offer;
    } else if (offer > max_dist[node][1]) {
        max_dist[node][1] = offer;
    }
}

void dfs1(int node, int parent) {
    for (int child : g[node]) {
        if (child == parent)
            continue;
        dfs1(child, node);
        update(node, max_dist[child][0] + 1);
    }
}

void dfs2(int node, int parent) {
    for (int child : g[node]) {
        if (child == parent)
            continue;
        if (max_dist[node][0] == max_dist[child][0] + 1) {
            update(child, max_dist[node][1] + 1);
        } else {
            update(child, max_dist[node][0] + 1);
        }
        dfs2(child, node);
    }
}

void solve() {
    int n;
    cin >> n;

    for (int i = 0; i < n - 1; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs1(1, 1);

    dfs2(1, 1);

    for (int i = 1; i <= n; ++i) {
        cout << max_dist[i][0] << ' ';
    }
    cout << '\n';
}
```

:::

### Tree Distances II


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，对每个节点求它到其余所有节点的距离之和并依次输出。

**解题思路**：

- **观察**：把根从 `u` 换到孩子 `v` 时，`v` 子树内的 `sz[v]` 个节点到新根的距离各减少 1，其余 $n - sz[v]$ 个节点各增加 1。

- **做法**：第一次 DFS 求子树大小 `sz[u]` 与深度 `dep[u]`（根取 `dep[1] = 1`，`ans[1]` 由 `dep[i] - 1` 累加，得到以边数计的根的距离和）。随后自顶向下调用 `fun`，按 $ans[v] = ans[u] - sz[v] + (n - sz[v])$ 一次换根求出全部答案。

- **边界**：`ans`、`sz`、`dep` 都用 `ll` 存放：根到所有节点的距离之和在最坏情况下可达 $O(n^2)$，会超出 `int` 范围。总时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n;
ll ans[N], sz[N], dep[N];
vector<int> G[N];
void dfs(int u, int fa) {
    dep[u] = dep[fa] + 1;
    sz[u] = 1;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dfs(v, u);
        sz[u] += sz[v];
    }
}
void fun(int u, int fa) {
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        ans[v] = ans[u] - sz[v] + n - sz[v];
        fun(v, u);
    }
}
void solve() {
    cin >> n;
    for (int i = 1; i <= n - 1; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) ans[1] += dep[i] - 1;
    fun(1, 0);
    for (int i = 1; i <= n; i++) cout << ans[i] << " ";
    cout << '\n';
}
```

:::

### Company Queries I


**题目大意**：公司层级构成一棵以 1 号员工为根的树：输入 `n`、`q`（$n, q \le 2 \times 10^5$）与 2 至 `n` 号员工各自的直接上级，随后 `q` 次询问，每次给出员工 `x` 与向上级数 `k`，求 `x` 向上第 `k` 级的上级；若不存在，输出 -1。

**解题思路**：倍增。`jmp[i][j]` 表示员工 `i` 向上 $2^j$ 级的节点，`jmp[i][0]` 由输入给出，递推 `jmp[i][j+1] = jmp[jmp[i][j]][j]`，建表循环条件 `(1 << j) <= n` 决定实际填充到第几列；更高列保持全局数组的初值 0，与哨兵一致。全局第 0 行恒为 0 作哨兵：根的父亲与越过头顶的祖先都落在 0 上，沿表继续跳跃仍停在 0。查询时从高位到低位扫描 `k`，对每个为 1 的位执行 `x = jmp[x][j]`；结束后 `x == 0` 说明第 `k` 级祖先不存在，输出 -1。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O((n + q)\log n)$，空间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int jmp[N][20];

void solve() {
    int n, q;

    cin >> n >> q;

    for (int i = 2; i <= n; ++i) {
        cin >> jmp[i][0];
    }

    for (int j = 0; (1 << j) <= n; ++j) {
        for (int i = 1; i <= n; ++i) {
            jmp[i][j + 1] = jmp[jmp[i][j]][j];
        }
    }

    for (int qi = 0; qi < q; ++qi) {
        int x, k;
        cin >> x >> k;

        for (int j = 19; j >= 0; --j) {
            if (k >> j & 1) {
                x = jmp[x][j];
            }
        }

        cout << (x ? x : -1) << '\n';
    }
}
```

:::

### Company Queries II


**题目大意**：公司层级构成一棵以 1 号员工为根的树：输入 `n`、`q`（$n, q \le 2 \times 10^5$）与 2 至 `n` 号员工各自的直接上级，随后 `q` 次询问，每次给出两名员工，求他们最近的共同上级，即最低公共祖先（LCA）。

**解题思路**：

- **做法**：重链剖分。`dfs1` 计算父节点 `fa`、深度 `dep`、子树大小 `sz`，并选出子树最大的孩子作为重儿子 `hson`；`dfs2` 给节点标号 `id`，令重儿子继承父节点的链顶、轻儿子以自身为链顶，链顶记入 `top`。查询时只要 `top[x] != top[y]`，就让链顶较深的一方跳到 `fa[top[x]]`；两点进入同一条重链后，深度较小者即 LCA。

- **正确性**：每次跳跃跨过的是一条轻边，轻儿子的子树大小不超过其父子树的一半（否则它会被选作重儿子），故每跳一次所在子树大小至少减半，单侧至多跳 $O(\log n)$ 次。两点同链后一个是另一个的祖先，深度较小者同时是它们的最近公共祖先。

- **边界**：`dep[1] = 0`；循环内链顶较深的一侧不可能是根所在的链（否则另一侧更深、会被交换），因此 `fa[top[x]]` 始终是有效节点。预处理时间复杂度为 $O(n)$，总时间复杂度为 $O(n + q\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, q;
vector<int> G[N];
int fa[N], sz[N], hson[N], dep[N];
int id[N], wt[N], top[N], tim;
void dfs1(int u, int f) {
    sz[u] = 1;
    fa[u] = f;
    int maxson = -1;
    for (auto v : G[u]) {
        if (v == f)
            continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > maxson) {
            maxson = sz[v];
            hson[u] = v;
        }
    }
}
void dfs2(int u, int topf) {
    id[u] = ++tim;
    top[u] = topf;
    if (!hson[u])
        return;
    dfs2(hson[u], topf);
    for (auto v : G[u]) {
        if (v == fa[u] || v == hson[u])
            continue;
        dfs2(v, v);
    }
}

int lca(int x, int y) {
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]])
            swap(x, y);
        x = fa[top[x]];
    }
    if (dep[x] > dep[y])
        swap(x, y);
    return x;
}
void solve() {
    cin >> n >> q;
    for (int i = 2; i <= n; i++) {
        int u;
        cin >> u;
        G[u].emplace_back(i);
        G[i].emplace_back(u);
    }
    dfs1(1, 0);
    dfs2(1, 1);
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << lca(l, r) << '\n';
    }
}
```

:::

### Distance Queries


**题目大意**：输入 `n`、`q`（$n, q \le 2 \times 10^5$）与 $n - 1$ 条边，随后 `q` 次询问，每次给出两个节点，求它们之间的距离，距离按路径上的边数计算。

**解题思路**：

- **做法**：欧拉序 + 稀疏表 RMQ 求 LCA。DFS 每次进入节点、以及从一个孩子返回时都把当前节点写入 `dfn`，欧拉序长 $2n - 1$；`pos[u]` 为 `u` 的首次出现位置，`dep[u]` 为深度（根为 0）。`f[i][j]` 表示 `dfn` 中从位置 `i` 起、长为 $2^j$ 的区间内深度最小的节点；`get(x, y)` 取 $a = \min(pos[x], pos[y])$、$b = \max(pos[x], pos[y])$，令 `Logn[b - a + 1]`（$b - a + 1$ 的以 2 为底的对数下取整）为 $s$，再取 `f[a][s]` 与 `f[b - (1 << s) + 1][s]` 中深度较小者，即两点的 LCA。答案为 $dep[x] + dep[y] - 2 \cdot dep[\mathrm{lca}]$。

- **边界**：`logn = 21` 覆盖 $2n - 1 \le 4 \times 10^5$ 的全部区间长度，建表时按 `i + (1 << j) - 1 <= tim` 限制右端点；根深度为 0，故上式直接给出路径上的边数。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O(n\log n + q)$，空间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

const int logn = 21;
int f[N << 1][logn + 1], Logn[N << 1];
void pre(int n) {
    Logn[1] = 0;
    Logn[2] = 1;
    for (int i = 3; i <= n; i++) Logn[i] = Logn[i / 2] + 1;
}
int n, q, h, tim, dfn[N << 1], dep[N << 1], pos[N << 1];
vector<int> G[N];
void dfs(int u, int fa, int h) {
    dfn[++tim] = u;
    pos[u] = tim;
    dep[u] = h;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dfs(v, u, h + 1);
        dfn[++tim] = u;
    }
}
int get(int x, int y) {
    int a, b;
    a = min(pos[x], pos[y]), b = max(pos[x], pos[y]);
    int s = Logn[b - a + 1];
    int lca =
        ((dep[f[a][s]] < dep[f[b - (1 << s) + 1][s]]) ? f[a][s]
                                                      : f[b - (1 << s) + 1][s]);
    return lca;
}
void solve() {
    cin >> n >> q;
    for (int i = 2; i <= n; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs(1, 0, 0);
    for (int i = 1; i <= 2 * n - 1; i++) f[i][0] = dfn[i];
    pre(tim);
    for (int j = 1; j <= logn; j++) {
        for (int i = 1; (i + (1 << j) - 1) <= tim; i++) {
            f[i][j] = (dep[f[i][j - 1]] < dep[f[i + (1 << (j - 1))][j - 1]])
                          ? f[i][j] = f[i][j - 1]
                          : f[i][j] = f[i + (1 << (j - 1))][j - 1];
        }
    }
    for (int i = 1; i <= q; i++) {
        int x, y;
        cin >> x >> y;
        cout << dep[x] + dep[y] - 2 * dep[get(x, y)] << '\n';
    }
}
```

:::

### Counting Paths


**题目大意**：输入 `n`、`q`（$n, q \le 2 \times 10^5$）与 $n - 1$ 条边，随后 `q` 行每行给出一条路径的两个端点，路径的两个端点所在节点也算被经过。输出每个节点被多少条路径经过。

**解题思路**：

- **观察**：链上加 1 可用树上差分拆成四个单点标记：对路径 `(x, y)` 在 `val[x]`、`val[y]` 处加 1、在 LCA 处与 LCA 的父亲处各减 1，最后自底向上累加即可还原每个节点的覆盖次数。

- **做法**：LCA 用欧拉序 + 稀疏表 RMQ 求：DFS 把每次进入节点与从孩子返回时的节点写入 `dfn`（长 $2n - 1$），`pos[u]` 为 `u` 的位置、`dep[u]` 为深度，`get(x, y)` 在其位置区间上取深度最小的节点。另一次 DFS（`dfs_fa`）记录每个节点的父亲 `fa`。对每条路径执行 `val[x]++`、`val[y]++`、`val[get(x, y)]--`、`val[fa[get(x, y)]]--`，随后后序把孩子的 `val` 累加到父亲。

- **正确性**：单条路径的两个端点各产生 1 股沿树向上累加的贡献，在 LCA 处两股汇合，`val[get(x, y)]` 处预置的 $-1$ 使该节点恰好保留 1；`val[fa[get(x, y)]]` 处再预置 $-1$，使这股贡献在 LCA 以上完全抵消。故自底向上累加后 `val[u]` 恰为经过 `u` 的路径数。

- **边界**：根的父亲 `fa[1] = 0`，落在 `val[0]` 上的 $-1$ 不影响任何节点的输出；`val` 用 `ll` 存放。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O(n\log n + q)$，空间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

const int logn = 21;
int f[N << 1][logn + 1], Logn[N << 1];
void pre(int n) {
    Logn[1] = 0;
    Logn[2] = 1;
    for (int i = 3; i <= n; i++) Logn[i] = Logn[i / 2] + 1;
}
int n, q, h, tim, dfn[N << 1], dep[N << 1], pos[N << 1];
vector<int> G[N];
void dfs(int u, int fa, int h) {
    dfn[++tim] = u;
    pos[u] = tim;
    dep[u] = h;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dfs(v, u, h + 1);
        dfn[++tim] = u;
    }
}
int get(int x, int y) {
    int a, b;
    a = min(pos[x], pos[y]), b = max(pos[x], pos[y]);
    int s = Logn[b - a + 1];
    int lca =
        ((dep[f[a][s]] < dep[f[b - (1 << s) + 1][s]]) ? f[a][s]
                                                      : f[b - (1 << s) + 1][s]);
    return lca;
}
ll val[N], fa[N];
void dfs_fa(int u, int f) {
    fa[u] = f;
    for (auto v : G[u]) {
        if (v == f)
            continue;
        dfs_fa(v, u);
    }
}

void solve() {
    cin >> n >> q;
    for (int i = 2; i <= n; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs_fa(1, 0);
    dfs(1, 0, 0);
    for (int i = 1; i <= 2 * n - 1; i++) f[i][0] = dfn[i];
    pre(tim);
    for (int j = 1; j <= logn; j++) {
        for (int i = 1; (i + (1 << j) - 1) <= tim; i++) {
            f[i][j] = (dep[f[i][j - 1]] < dep[f[i + (1 << (j - 1))][j - 1]])
                          ? f[i][j] = f[i][j - 1]
                          : f[i][j] = f[i + (1 << (j - 1))][j - 1];
        }
    }
    for (int i = 1; i <= q; i++) {
        int x, y;
        cin >> x >> y;
        val[x]++;
        val[y]++;
        val[get(x, y)]--;
        val[fa[get(x, y)]]--;
    }
    function<void(int, int)> dfs_ans = [&](int u, int fa) {
        for (auto v : G[u]) {
            if (v == fa)
                continue;
            dfs_ans(v, u);
            val[u] += val[v];
        }
    };
    dfs_ans(1, 0);
    for (int i = 1; i <= n; i++) cout << val[i] << " ";
    cout << '\n';
}
```

:::

### Subtree Queries


**题目大意**：输入一棵以 1 为根的带权树：`n`、`q`（$n, q \le 2 \times 10^5$）、各节点权值与 $n - 1$ 条边。操作有两种：把节点 `l` 的权值改为 `r`；查询以节点 `x` 为根的整棵子树的权值和。

**解题思路**：

- **做法**：DFS 序 + 树状数组。DFS 进入 `u` 时记 `in[u] = ++tim`，处理完孩子后记 `out[u] = tim`，则 `u` 的子树恰对应闭区间 `[in[u], out[u]]`；`id[dfn[i]] = i` 使 `id[u] = in[u]`。树状数组按下标（即 DFS 序位置）维护权值：建树时对每个位置 `i` 执行 `add(i, val[dfn[i]])`，子树和查询为 `sum(out[x]) - sum(in[x] - 1)`。

- **边界**：单点赋值用差值实现：`add(id[l], r - sum(id[l]) + sum(id[l] - 1))`，其中 `sum(id[l]) - sum(id[l] - 1)` 是节点 `l` 的旧权值，加入新值与之差即完成覆盖写。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O((n + q)\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, m, tim, val[N], in[N], out[N], dfn[N], id[N];
vector<int> G[N];
void dfs(int u, int fa) {
    in[u] = ++tim;
    dfn[tim] = u;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        dfs(v, u);
    }
    out[u] = tim;
}
ll BIT[N];
void add(int d, int v) {
    for (; d <= n; d += ((d) & -(d))) BIT[d] += v;
}
ll sum(int d) {
    ll res = 0;
    for (; d; d -= ((d) & -(d))) res += BIT[d];
    return res;
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> val[i];
    for (int i = 2; i <= n; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) id[dfn[i]] = i;
    for (int i = 1; i <= n; i++) add(i, val[dfn[i]]);
    while (m--) {
        int opt;
        cin >> opt;
        if (opt == 1) {
            int l, r;
            cin >> l >> r;
            add(id[l], r - sum(id[l]) + sum(id[l] - 1));
        } else {
            int x;
            cin >> x;
            cout << sum(out[x]) - sum(in[x] - 1) << '\n';
        }
    }
}
```

:::

### Path Queries


**题目大意**：输入一棵以 1 为根的带权树：`n`、`q`（$n, q \le 2 \times 10^5$）、各节点权值与 $n - 1$ 条边。操作有两种：把节点 `s` 的权值改为 `x`；查询从根节点到节点 `s` 的路径权值和。

**解题思路**：

- **观察**：在 `order_in[u]` 处计入 `value[u]`、在 `order_out[u]` 处扣掉 `value[u]` 后，前缀和只受「进入位置不晚于 `order_in[s]`、且离开位置晚于 `order_in[s]`」的节点影响，即根到 `s` 路径上的节点。

- **做法**：DFS 记录 `order_in[u] = order_index++` 与 `order_out[u]`（处理完子树后的 `order_index`），节点 `u` 对应半开区间 `[order_in[u], order_out[u])`。树状数组在进入位置加 `value[u]`、在离开位置加 `-value[u]`；查询即输出 `tree.query(order_in[s])`。修改时先撤销旧值（`tree.add(order_in[s], -value[s])`、`tree.add(order_out[s], value[s])`），再把 `value[s]` 改为 `x` 并以相反符号写入新值。

- **正确性**：节点 `u` 是 `s` 的祖先（含 `s` 自身）当且仅当 `u` 的区间包含 `order_in[s]`，此时它的加标记已计入而减标记尚未计入；其余节点的两个标记要么都未计入、要么都已计入而相互抵消。因此前缀和恰为根到 `s` 的路径权值和。

- **边界**：根的 `order_out[1] = n + 1` 超出树状数组下标范围，`add` 的循环条件 `k <= n` 使该次减法被自然忽略。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O((n + q)\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

struct FenwickTree {
    int n;
    vector<ll> tree;

    FenwickTree(int n) : n(n), tree(n + 1) {}

    void add(int k, int d) {
        while (k <= n) {
            tree[k] += d;
            k += k & -k;
        }
    }

    ll query(int k) {
        ll s = 0;
        while (k > 0) {
            s += tree[k];
            k -= k & -k;
        }
        return s;
    }
};

vector<int> g[N];
int order_in[N], order_out[N], order_index = 1;

void dfs(int node, int parent) {
    order_in[node] = order_index++;
    for (int child : g[node]) {
        if (child == parent)
            continue;
        dfs(child, node);
    }
    order_out[node] = order_index;
}

int value[N];

void solve() {
    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; ++i) {
        cin >> value[i];
    }

    for (int i = 1; i <= n - 1; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs(1, -1);

    FenwickTree tree(n);

    for (int i = 1; i <= n; ++i) {
        tree.add(order_in[i], value[i]);
        tree.add(order_out[i], -value[i]);
    }

    for (int qi = 1; qi <= q; ++qi) {
        int t, s;
        cin >> t >> s;
        if (t == 1) {
            int x;
            cin >> x;
            tree.add(order_in[s], -value[s]);
            tree.add(order_out[s], value[s]);
            value[s] = x;
            tree.add(order_in[s], value[s]);
            tree.add(order_out[s], -value[s]);
        } else {
            cout << tree.query(order_in[s]) << '\n';
        }
    }
}
```

:::

### Path Queries II


**题目大意**：输入一棵带权树：`n`、`q`（$n, q \le 2 \times 10^5$）、各节点权值与 $n - 1$ 条边。操作有两种：把节点 `l` 的权值改为 `r`；查询节点 `l` 到 `r` 之间路径上的最大权值。

**解题思路**：

- **做法**：重链剖分 + 迭代线段树。`dfs1` 计算 `fa`、`dep`、`sz` 与重儿子 `hson`；`dfs2` 给同一条重链上的节点连续编号 `id`（`wt[id[u]] = val[u]`），并记录链顶 `top`。`ask(x, y)` 在链顶不同时处理链顶较深的一侧：查询该侧 `[top[x], x]` 整段后令 `x = fa[top[x]]`；两点同链时先交换到 `dep[x] <= dep[y]`，再查询其间一段。

- **边界**：`id` 从 1 开始而线段树逻辑位置从 0 开始：建树用 `modify(i - 1, wt[i])`，路径上的节点闭区间 `[id[a], id[b]]` 转为 `query(id[a] - 1, id[b])`，修改用 `modify(id[l] - 1, r)`。

- **正确性**：路径被拆成至多 $O(\log n)$ 段同链区间，每段由线段树以左闭右开区间处理；单点修改只需自底向上更新一条合并链。预处理时间复杂度为 $O(n\log n)$，总时间复杂度为 $O(n\log n + q\log^2 n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

int n, q, val[N];
ll t[2 * N];
void modify(int p, ll value) {
    for (t[p += n] = value; p > 1; p >>= 1) t[p >> 1] = max(t[p], t[p ^ 1]);
}
ll query(int l, int r) {
    ll res = 0;
    for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
        if (l & 1)
            res = max(t[l++], res);
        if (r & 1)
            res = max(res, t[--r]);
    }
    return res;
}
vector<int> G[N];
int fa[N], sz[N], hson[N], dep[N];
int id[N], wt[N], top[N], tim;
void dfs1(int u, int f) {
    sz[u] = 1;
    fa[u] = f;
    int maxson = -1;
    for (auto v : G[u]) {
        if (v == f)
            continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > maxson) {
            maxson = sz[v];
            hson[u] = v;
        }
    }
}
void dfs2(int u, int topf) {
    id[u] = ++tim;
    wt[tim] = val[u];
    top[u] = topf;
    if (!hson[u])
        return;
    dfs2(hson[u], topf);
    for (auto v : G[u]) {
        if (v == fa[u] || v == hson[u])
            continue;
        dfs2(v, v);
    }
}

ll ask(int x, int y) {
    ll ans = 0;
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]])
            swap(x, y);
        ans = max(ans, query(id[top[x]] - 1, id[x]));
        x = fa[top[x]];
    }
    if (dep[x] > dep[y])
        swap(x, y);
    ans = max(ans, query(id[x] - 1, id[y]));
    return ans;
}
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> val[i];
    for (int i = 2; i <= n; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    dfs1(1, 0);
    dfs2(1, 1);
    for (int i = 1; i <= n; i++) modify(i - 1, wt[i]);
    while (q--) {
        int opt, l, r;
        cin >> opt >> l >> r;
        if (opt == 1)
            modify(id[l] - 1, r);
        else
            cout << ask(l, r) << " ";
    }
}
```

:::

### Distinct Colors


**题目大意**：输入一棵以 1 为根的树（$n \le 2 \times 10^5$）：各节点颜色与 $n - 1$ 条边。求每个节点的子树中出现了多少种不同的颜色并依次输出。

**解题思路**：

- **观察**：把每个子树看成一个颜色集合，合并孩子集合时把小的并入大的（small-to-large），元素的迁移次数可摊还。

- **做法**：DFS 返回子树颜色集合 `set<int>`，初始只含 `color[node]`；得到孩子集合 `child_colors` 后，若它更大则 `swap` 二者，再 `colors.merge(child_colors)` 把新颜色并入当前集合。合并后 `colors.size()` 即该子树的不同颜色数，记入 `answer[node]`。

- **正确性**：`merge` 只把当前集合中没有的颜色从源集合移入，重复颜色留在源集合并被丢弃，故合并结果恰为子树全部不同颜色；small-to-large 保证元素每次被迁移时目标集合至少翻倍，单个元素至多迁移 $O(\log n)$ 次，每次红黑树操作为 $O(\log n)$。总时间复杂度为 $O(n\log^2 n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> g[N];
int answer[N], color[N];

set<int> dfs(int node, int parent) {
    set<int> colors{color[node]};
    for (int child : g[node]) {
        if (child == parent)
            continue;
        auto child_colors = dfs(child, node);
        if (child_colors.size() > colors.size()) {
            swap(colors, child_colors);
        }
        colors.merge(child_colors);
    }
    answer[node] = colors.size();
    return colors;
}
void solve() {
    int n;
    cin >> n;

    for (int i = 1; i <= n; ++i) {
        cin >> color[i];
    }

    for (int i = 0; i < n - 1; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs(1, -1);

    for (int i = 1; i <= n; ++i) {
        cout << answer[i] << ' ';
    }
    cout << '\n';
}
```

:::

### Finding a Centroid


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，求它的一个质心：删除质心及其相连的边后，剩余每个连通块的节点数都不超过 $n / 2$。

**解题思路**：以 1 为根 DFS 求子树大小 `sz[u]` 与孩子子树大小的最大值 `max_child[u]`。删除节点 `i` 后，各孩子方向的连通块大小为 `sz[child]`，父亲方向为 $n - sz[i]$；最大连通块即 `max_child[i]` 与 $n - sz[i]$ 的较大者，其值不超过 $n / 2$ 的节点即为质心（树必存在质心，枚举中必有解）。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> g[N];
int sz[N], max_child[N];

void dfs(int node, int parent) {
    sz[node] = 1;
    for (int child : g[node]) {
        if (child == parent)
            continue;
        dfs(child, node);
        sz[node] += sz[child];
        max_child[node] = max(max_child[node], sz[child]);
    }
}
void solve() {
    int n;
    cin >> n;

    for (int i = 1; i <= n - 1; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs(1, -1);

    for (int i = 1; i <= n; ++i) {
        if (max(max_child[i], n - sz[i]) <= n / 2) {
            cout << i << '\n';
            break;
        }
    }
}
```

:::

### Fixed-Length Paths I


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，再给出整数 `k`，统计树上长度恰好为 `k` 的简单路径数量，路径长度按边数计算。

**解题思路**：

- **观察**：点分治按质心分层统计：经过当前质心的路径由两个不同方向（不同邻接子树，或一端为质心自身）的端点组成，其余路径留给递归的连通块。

- **做法**：`decompose(u)` 先用 `get_sz` 求当前连通块大小、用 `get_centroid` 取出质心并标记 `vis`；`cnt[d]` 为已处理方向上到质心距离为 `d` 的节点数，初始 `cnt[0] = 1`（质心自身）。逐棵处理邻接子树：`get_dist(v, centroid, 1, sub_dists)` 收集子树内深度不超过 `k` 的距离 `d`，并在收集时累加 `ans += cnt[k - d]`；收完该子树后才把 `sub_dists` 中的距离加入 `cnt` 与 `all_dists`。本层结束按 `all_dists` 清空 `cnt`，再对各邻接子树递归。

- **正确性**：查询 `cnt[k - d]` 时 `cnt` 中只有质心与先前处理过的子树，因此被统计的路径必经过质心且两端不同向；两端同属一棵子树的路径留到该子树的递归层统计，每条路径恰在其两端首次被分开的质心处计数一次。分治共 $O(\log n)$ 层、每层遍历 $O(n)$ 个节点，总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> adj[N];
int sz[N];
bool vis[N];
int cnt[N];
int max_d;
ll ans = 0;
int n, k;

void get_sz(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) {
        if (v != p && !vis[v]) {
            get_sz(v, u);
            sz[u] += sz[v];
        }
    }
}

int get_centroid(int u, int p, int total) {
    for (int v : adj[u]) {
        if (v != p && !vis[v] && sz[v] > total / 2)
            return get_centroid(v, u, total);
    }
    return u;
}

void get_dist(int u, int p, int d, vector<int>& dists) {
    if (d > k)
        return;
    dists.push_back(d);
    ans += cnt[k - d];
    for (int v : adj[u]) {
        if (v != p && !vis[v])
            get_dist(v, u, d + 1, dists);
    }
}

void decompose(int u) {
    get_sz(u, -1);
    int centroid = get_centroid(u, -1, sz[u]);
    vis[centroid] = true;

    cnt[0] = 1;
    max_d = 0;
    vector<int> all_dists;
    all_dists.push_back(0);

    for (int v : adj[centroid]) {
        if (!vis[v]) {
            vector<int> sub_dists;
            get_dist(v, centroid, 1, sub_dists);
            for (int d : sub_dists) {
                cnt[d]++;
                all_dists.push_back(d);
                max_d = max(max_d, d);
            }
        }
    }

    for (int d : all_dists) cnt[d] = 0;

    for (int v : adj[centroid]) {
        if (!vis[v])
            decompose(v);
    }
}
void solve() {
    cin >> n >> k;
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    decompose(1);
    cout << ans << '\n';
}
```

:::

### Fixed-Length Paths II


**题目大意**：输入 `n`（$n \le 2 \times 10^5$）与 $n - 1$ 条边，再给出两个整数 `k1`、`k2`，统计树上长度落在 $[k_1, k_2]$ 内的简单路径数量，路径长度按边数计算。

**解题思路**：

- **观察**：点分治按质心分层统计：经过当前质心的路径，两端首次分属不同方向（不同邻接子树，或一端就是质心）。本层要统计的就是距离之和落在 $[k_1, k_2]$ 内的点对。

- **做法**：`decompose(u)` 先求块大小、取质心并置 `vis`；用一棵按深度计数的树状数组维护**已处理方向**上到质心的距离（初始把质心的距离 0 记 +1）。逐棵处理邻接子树：先用 `get_dist(v, centroid, 1, sub_dists)` 遍历子树，对每个距离 `d` 累加 $pre(k_2-d)-pre(k_1-d-1)$（`pre(x)` 是树状数组里距离 $\le x$ 的节点数），再把这棵子树的距离整体写进树状数组。因为查询发生在写入之前，配对的另一端只能来自质心或更早的子树。本层结束后把 `all_dists` 里的距离全部撤销，再递归各子树。

- **正确性**：每对端点在其路径上「第一个把它们分开的质心」处恰好被计一次：同侧的点对在本层查不到（还没写入），留给子树递归；不同侧的点对被 `pre` 的区间和恰好数一次。每层处理 $O(size)$ 个节点、每次查询 $O(\log n)$，分治共 $O(\log n)$ 层，总时间复杂度为 $O(n\log^2 n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;

vector<int> adj[N];
int sz[N];
bool vis[N];
int bit[N];                                  // 树状数组：按下标「距离 + 1」计数
ll ans = 0;
int n, k1, k2;

void upd(int d, int v) {                     // 距离 d 出现 v 次
    for (int i = d + 1; i <= n + 1; i += i & -i) bit[i] += v;
}
int pre(int d) {                             // 已处理节点中距离 <= d 的个数
    if (d < 0) return 0;
    if (d > n) d = n;
    int res = 0;
    for (int i = d + 1; i > 0; i -= i & -i) res += bit[i];
    return res;
}

void get_sz(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) {
        if (v != p && !vis[v]) {
            get_sz(v, u);
            sz[u] += sz[v];
        }
    }
}

int get_centroid(int u, int p, int total) {
    for (int v : adj[u]) {
        if (v != p && !vis[v] && sz[v] > total / 2)
            return get_centroid(v, u, total);
    }
    return u;
}

void get_dist(int u, int p, int d, vector<int>& dists) {
    if (d > k2)
        return;                              // 更深就超过 k2，整棵子树都不会有贡献
    dists.push_back(d);
    ans += pre(k2 - d) - pre(k1 - d - 1);    // 另一端距离落在 [k1 - d, k2 - d] 的已处理节点
    for (int v : adj[u]) {
        if (v != p && !vis[v])
            get_dist(v, u, d + 1, dists);
    }
}

void decompose(int u) {
    get_sz(u, -1);
    int centroid = get_centroid(u, -1, sz[u]);
    vis[centroid] = true;

    vector<int> all_dists;
    upd(0, 1);
    all_dists.push_back(0);                  // 质心自身，距离 0

    for (int v : adj[centroid]) {
        if (!vis[v]) {
            vector<int> sub_dists;
            get_dist(v, centroid, 1, sub_dists);   // 必须先查询、再把本子树写进 BIT
            for (int d : sub_dists) {
                upd(d, 1);
                all_dists.push_back(d);
            }
        }
    }

    for (int d : all_dists) upd(d, -1);      // 本层结束，把树状数组恢复原状

    for (int v : adj[centroid]) {
        if (!vis[v])
            decompose(v);
    }
}
void solve() {
    cin >> n >> k1 >> k2;
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    decompose(1);
    cout << ans << '\n';
}
```

:::

## Sliding Window Problems

### Sliding Window Sum


**题目大意**：给定 `n`、`k` 与线性同余生成器的参数 `x, a, b, c`（$n \le 10^5$），按 `arr[0] = x`、`arr[i] = (a * arr[i-1] + b) % c` 生成 `n` 个数。对全部 $n-k+1$ 个长度为 `k` 的连续窗口求和，输出这些窗口和的异或值。

**解题思路**：滑动维护窗口和。先累加前 `k` 个数得到第一个窗口的和 `sum`，并把它作为 `ans` 的初值；之后每右移一格执行 `sum += arr[i] - arr[i-k]`，再把新的 `sum` 异或进 `ans`。每个元素只被加入、移除各一次。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    ll x, a, b, c;
    cin >> x >> a >> b >> c;
    vector<ll> arr(n);
    arr[0] = x;
    for (int i = 1; i < n; i++) arr[i] = (a * arr[i - 1] + b) % c;
    ll sum = 0;
    for (int i = 0; i < k; i++) sum += arr[i];
    ll ans = sum;
    for (int i = k; i < n; i++) {
        sum += arr[i] - arr[i - k];
        ans ^= sum;
    }
    cout << ans << '\n';
}
```

:::

### Sliding Window Minimum


**题目大意**：给定 `n`、`k` 与线性同余生成器的参数 `x, a, b, c`（$n \le 10^5$），按 `arr[0] = x`、`arr[i] = (a * arr[i-1] + b) % c` 生成 `n` 个数。对全部 $n-k+1$ 个长度为 `k` 的连续窗口求最小值，输出这些最小值的异或值。

**解题思路**：用单调队列维护窗口最小值。队列 `dq` 存下标，其对应的 `arr` 值递增：加入 `i` 时先弹出队尾所有满足 `arr[dq.back()] >= arr[i]` 的下标（它们既比 `arr[i]` 大又更早离开窗口，不可能再成为任何窗口的最小值），再弹出队首已过期的下标（`dq.front() <= i - k`）；此后 `dq.front()` 就是当前窗口的最小值，窗口成形（`i >= k - 1`）后依次异或进 `ans`。每个下标至多入队、出队一次。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    ll x, a, b, c;
    cin >> x >> a >> b >> c;
    vector<ll> arr(n);
    arr[0] = x;
    for (int i = 1; i < n; i++) arr[i] = (a * arr[i - 1] + b) % c;
    deque<int> dq;
    ll ans = 0;
    for (int i = 0; i < n; i++) {
        while (!dq.empty() && arr[dq.back()] >= arr[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k)
            dq.pop_front();
        if (i >= k - 1)
            ans ^= arr[dq.front()];
    }
    cout << ans << '\n';
}
```

:::

### Sliding Window Xor


**题目大意**：给定 `n`、`k` 与线性同余生成器的参数 `x, a, b, c`（$n \le 10^5$），按 `arr[0] = x`、`arr[i] = (a * arr[i-1] + b) % c` 生成 `n` 个数。对每个长度为 `k` 的连续窗口求窗口内所有数的异或，输出全部 $n-k+1$ 个窗口异或值的异或值。

**解题思路**：利用异或的自消性 $x \oplus x = 0$ 增量维护窗口异或 `cur`。先对前 `k` 个数求异或得到第一个窗口的值，并把它作为 `ans` 的初值；窗口右移时执行 `cur ^= arr[i] ^ arr[i-k]`——新进入的元素被异或一次，离开的元素被再异或一次而抵消。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    ll x, a, b, c;
    cin >> x >> a >> b >> c;
    vector<ll> arr(n);
    arr[0] = x;
    for (int i = 1; i < n; i++) arr[i] = (a * arr[i - 1] + b) % c;
    ll cur = 0;
    for (int i = 0; i < k; i++) cur ^= arr[i];
    ll ans = cur;
    for (int i = k; i < n; i++) {
        cur ^= arr[i] ^ arr[i - k];
        ans ^= cur;
    }
    cout << ans << '\n';
}
```

:::

### Sliding Window Or


**题目大意**：给定 `n`、`k` 与线性同余生成器的参数 `x, a, b, c`（$n \le 10^5$，生成的每个数小于 $2^{30}$），按 `arr[0] = x`、`arr[i] = (a * arr[i-1] + b) % c` 生成 `n` 个数。对每个长度为 `k` 的连续窗口求窗口内所有数的按位或，输出全部 $n-k+1$ 个窗口或值的异或值。

**解题思路**：

- **观察**：按位独立。对第 `b` 位，窗口的或在该位为 0 当且仅当窗口内每个数该位都是 0，即整个窗口落在该位的连续 0 段内，也就是该段长度至少为 `k`。

- **做法**：逐位扫描，用 `len0` 记录以当前位置结尾的连续 0 段长度。`arr[i]` 的第 `b` 位为 0 时 `len0` 加 1、为 1 时清零，代码用无分支掩码实现：`mask = 0 - (((arr[i] >> b) & 1) ^ 1)`（该位为 0 时 `mask` 全 1、为 1 时 `mask` 为 0），再取 `len0 = (len0 + 1) & mask`。每一步若 `len0 >= k`，说明又多了一个该位为 0 的窗口，累加进 `zeroWin`。

- **正确性**：该位为 1 的窗口数为 `oneWin = total - zeroWin`，其中 `total = n - k + 1`；最终答案只取异或，故 `oneWin` 为奇数时把第 `b` 位或进 `ans` 即可。时间复杂度为 $O(30n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef unsigned int uint;
void solve() {
    int n, k;
    cin >> n >> k;
    ll x, a, b, c;
    cin >> x >> a >> b >> c;
    vector<uint> arr(n);
    arr[0] = (uint)x;
    for (int i = 1; i < n; i++) arr[i] = (uint)((a * (ll)arr[i - 1] + b) % c);
    ll ans = 0;
    ll total = (ll)n - k + 1;

    for (int b = 0; b < 30; b++) {
        ll zeroWin = 0;
        uint len0 = 0;
        for (int i = 0; i < n; i++) {
            uint mask = 0u - (((arr[i] >> b) & 1u) ^ 1u);
            len0 = (len0 + 1) & mask;
            zeroWin += (len0 >= (uint)k) ? 1 : 0;
        }
        ll oneWin = total - zeroWin;
        if (oneWin & 1)
            ans |= 1LL << b;
    }
    cout << ans << '\n';
}
```

:::

### Sliding Window Distinct Values


**题目大意**：给定 `n` 个整数与窗口长度 `k`（$n \le 2 \times 10^5$），依次输出每个长度为 `k` 的连续窗口中不同数值的个数。

**解题思路**：先把数值离散化到 `idx[i]`，用 `cnt[idx[i]]` 记录每个值在当前窗口内的出现次数。窗口右移时先加入新元素 `a[i]`：若它的计数从 0 变 1，说明窗口内出现了一个新值，`distinct` 加 1；若窗口已超长（`i >= k`）再移除 `a[i-k]`：它的计数减到 0 时该值已离开窗口，`distinct` 减 1。窗口成形（`i >= k - 1`）后依次输出 `distinct`。时间复杂度为 $O(n \log n)$（瓶颈在离散化的排序），空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    vector<ll> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    vector<int> idx(n);
    for (int i = 0; i < n; i++)
        idx[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin();
    vector<int> cnt(vals.size(), 0);
    int distinct = 0;
    for (int i = 0; i < n; i++) {
        if (++cnt[idx[i]] == 1)
            distinct++;
        if (i >= k) {
            if (--cnt[idx[i - k]] == 0)
                distinct--;
        }
        if (i >= k - 1)
            cout << distinct << ' ';
    }
    cout << '\n';
}
```

:::

### Sliding Window Mode


**题目大意**：给定 `n` 个整数与窗口长度 `k`（$n \le 2 \times 10^5$），输出每个长度为 `k` 的连续窗口的众数，即窗口内出现次数最多的数值；出现次数并列时取数值最小的那个。

**解题思路**：

- **做法**：离散化后维护 `cnt[idx]`（每个值的出现次数）与 `freqSet[f]`（出现次数恰为 `f` 的全部数值，用有序集合存放）。`add` 把元素从频率 `f` 的桶移到 `f + 1` 的桶，并用 `max(maxf, f + 1)` 更新 `maxf`；`rem` 把它从 `f` 移到 `f - 1`，若 `freqSet[maxf]` 已经为空就令 `maxf` 减 1。每个窗口的众数即 `freqSet[maxf]` 中的最小值（并列取小），输出 `vals[*freqSet[maxf].begin()]`。

- **正确性**：加入一个元素只会让该值的频率加 1，故 `maxf` 至多增 1；移除一个元素只会让某个值的频率减 1，若此时最大频率桶为空，则其余值的频率都不超过 `maxf - 1`，故 `maxf` 至多减 1——两个方向的调整都是精确的。时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;

    vector<ll> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    vector<int> idx(n);
    for (int i = 0; i < n; i++)
        idx[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin();
    vector<int> cnt(vals.size(), 0);
    vector<set<int>> freqSet(n + 1);
    int maxf = 0;
    auto add = [&](int i) {
        int f = cnt[idx[i]];
        if (f > 0)
            freqSet[f].erase(idx[i]);
        cnt[idx[i]] = f + 1;
        freqSet[f + 1].insert(idx[i]);
        maxf = max(maxf, f + 1);
    };
    auto rem = [&](int i) {
        int f = cnt[idx[i]];
        freqSet[f].erase(idx[i]);
        cnt[idx[i]] = f - 1;
        if (f - 1 > 0)
            freqSet[f - 1].insert(idx[i]);
        if (freqSet[maxf].empty())
            maxf--;
    };
    for (int i = 0; i < n; i++) {
        add(i);
        if (i >= k)
            rem(i - k);
        if (i >= k - 1)
            cout << vals[*freqSet[maxf].begin()] << ' ';
    }
    cout << '\n';
}
```

:::

### Sliding Window Mex


**题目大意**：给定 `n` 个非负整数与窗口长度 `k`（$n \le 2 \times 10^5$），输出每个长度为 `k` 的连续窗口的 mex，即窗口内未出现的最小非负整数。

**解题思路**：窗口中只有 `k` 个数，故 mex 一定不超过 `k`，值大于 `n` 的数可以整体忽略。维护 `cnt[0..n]` 与有序集合 `missing`（初始存放所有 $0..n+1$，表示尚未出现在窗口中的值）：`add` 时若某值的计数从 0 变 1 就把它从 `missing` 中删除，`rem` 时若某值的计数减到 0 就把它插回。窗口成形后 `*missing.begin()` 即该窗口的 mex。时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;

    vector<int> cnt(n + 2, 0);
    set<int> missing;
    for (int v = 0; v <= n + 1; v++) missing.insert(v);
    auto add = [&](ll x) {
        if (x > n)
            return;
        if (cnt[x]++ == 0)
            missing.erase((int)x);
    };
    auto rem = [&](ll x) {
        if (x > n)
            return;
        if (--cnt[x] == 0)
            missing.insert((int)x);
    };
    for (int i = 0; i < n; i++) {
        add(a[i]);
        if (i >= k)
            rem(a[i - k]);
        if (i >= k - 1)
            cout << *missing.begin() << ' ';
    }
    cout << '\n';
}
```

:::

### Sliding Window Median


**题目大意**：给定 `n` 个整数与窗口长度 `k`（$n \le 2 \times 10^5$），输出每个长度为 `k` 的连续窗口的中位数；`k` 为偶数时取较小的那个，也就是第 $(k-1)/2$ 小（下标从 0 开始）。

**解题思路**：用 PBDS 的顺序统计树 `indexed_set` 维护窗口，元素取 `pair<int, int>` 形式的 `{x[i], i}`，这样重复的数值也能唯一区分。窗口右移时插入 `{x[i], i}`、删除离开窗口的 `{x[i-k], i-k}`，每个窗口输出 `find_by_order((k-1)/2)->first` 的值分量。时间复杂度为 $O(n \log k)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
template <typename T>
using indexed_set =
    __gnu_pbds::tree<T, __gnu_pbds::null_type, less<T>, __gnu_pbds::rb_tree_tag,
                     __gnu_pbds::tree_order_statistics_node_update>;
void solve() {
    int n, k;
    cin >> n >> k;
    vector<int> x(n);
    for (int i = 0; i < n; i++) {
        cin >> x[i];
    }

    indexed_set<pair<int, int>> s;

    for (int i = 0; i < n; i++) {
        s.insert({x[i], i});
        if (i >= k) {
            s.erase({x[i - k], i - k});
        }
        if (i >= k - 1) {
            int median = s.find_by_order((k - 1) / 2)->first;
            cout << median << " ";
        }
    }
    cout << "\n";
}
```

:::

### Sliding Window Cost


**题目大意**：给定 `n` 个整数与窗口长度 `k`（$n \le 2 \times 10^5$），对每个长度为 `k` 的连续窗口，求把窗口内所有数改成同一个数所需的最小总代价；把一个数改成目标值的代价为二者之差的绝对值。

**解题思路**：

- **观察**：目标值取窗口中位数时最优。设目标值为 `t`、总代价为 $f(t)=\sum_i |x_i-t|$：`t` 每向右移动 $\Delta$，比 `t` 小的元素代价各增 $\Delta$、比 `t` 大的各减 $\Delta$，因此 $f$ 的斜率等于（小于 `t` 的元素个数 − 大于 `t` 的元素个数），它在中位数处由负变正，极小值就在中位数取得。

- **做法**：用两个 `multiset` 维护窗口：`left` 存较小的一半（元素个数等于 `right`，或比它多 1），`right` 存较大的一半，同时维护两侧元素和 `left_sum`、`right_sum`；`fix` 负责恢复「`left` 的最大值不超过 `right` 的最小值、两侧大小差不超过 1」。`add` 按 `v` 是否小于 `left` 的最大值决定放入哪一侧，`rem` 用 `*left.rbegin() >= v` 判断 `v` 在 `left` 还是 `right`，两者都在改动后调用 `fix`。窗口代价为 `left.size() * median - left_sum + right_sum - right.size() * median`，其中 `median = *left.rbegin()`，即左半全部升到中位数、右半全部降到中位数。时间复杂度为 $O(n \log k)$，空间复杂度为 $O(k)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<int> x(n);
    for (int i = 0; i < n; i++) {
        cin >> x[i];
    }

    multiset<int> left, right;
    ll left_sum = 0, right_sum = 0;

    auto fix = [&] {
        if (left.size() > right.size() + 1) {
            auto v = *left.rbegin();
            left_sum -= v;
            right_sum += v;
            right.insert(v);
            left.erase(left.find(v));
        }
        if (right.size() > left.size()) {
            auto v = *right.begin();
            right_sum -= v;
            left_sum += v;
            left.insert(v);
            right.erase(right.find(v));
        }
    };

    auto add = [&](int v) {
        if (!left.empty() && *left.rbegin() > v) {
            left.insert(v);
            left_sum += v;
        } else {
            right.insert(v);
            right_sum += v;
        }
        fix();
    };

    auto rem = [&](int v) {
        if (*left.rbegin() >= v) {
            left.erase(left.find(v));
            left_sum -= v;
        } else {
            right.erase(right.find(v));
            right_sum -= v;
        }
        fix();
    };

    auto cost = [&] {
        ll median = *left.rbegin();
        ll left_cost = left.size() * median - left_sum;
        ll right_cost = right_sum - right.size() * median;
        return left_cost + right_cost;
    };

    for (int i = 0; i < n; i++) {
        add(x[i]);
        if (i >= k) {
            rem(x[i - k]);
        }
        if (i >= k - 1) {
            cout << cost() << " ";
        }
    }
    cout << "\n";
}
```

:::

### Sliding Window Inversions


**题目大意**：给定 `n` 个整数与窗口长度 `k`（$n \le 2 \times 10^5$），对每个长度为 `k` 的连续窗口，输出窗口内的逆序对数，即满足 `j < j'` 且 `a[j] > a[j']` 的下标对数。

**解题思路**：

- **做法**：把数值离散化成名次 `gi(a[i])`，用树状数组 `bit` 按名次统计窗口内的元素个数，增量维护逆序对数 `inv`。加入右端元素 `a[i]` 时，它与窗口内已有元素形成的逆序对个数为「比它大的元素个数」，等于加入前的窗口大小 `w = min(i, k)` 减去「不大于它的元素个数」`qry(g)`（其中 `g = gi(a[i])`），把这份贡献累加进 `inv`；元素滑出左端时，要撤掉以它为较大者的全部逆序对，个数就是窗口内比它小的元素个数 `qry(gr - 1)`（其中 `gr = gi(a[i-k])`）。

- **边界**：代码先加入新元素、再删除旧元素，因此移除 `a[i-k]` 时它仍在树状数组内，`qry(gr - 1)` 统计的是加入后窗口内严格小于 `a[i-k]` 的元素个数，恰好是以它为较大者的逆序对数，不重不漏；窗口未成形（`i < k - 1`）时不输出。时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto& v : a) cin >> v;
    vector<ll> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    vector<int> bit(vals.size() + 2, 0);
    auto upd = [&](int i, int d) {
        for (; i <= (int)vals.size(); i += i & -i) bit[i] += d;
    };
    auto qry = [&](int i) {
        int s = 0;
        for (; i > 0; i -= i & -i) s += bit[i];
        return s;
    };
    auto gi = [&](ll v) {
        return lower_bound(vals.begin(), vals.end(), v) - vals.begin() + 1;
    };
    ll inv = 0;
    for (int i = 0; i < n; i++) {
        int g = gi(a[i]);
        int w = min(i, k);
        inv += w - qry(g);
        upd(g, 1);
        if (i >= k) {
            int gr = gi(a[i - k]);
            inv -= qry(gr - 1);
            upd(gr, -1);
        }
        if (i >= k - 1)
            cout << inv << ' ';
    }
    cout << '\n';
}
```

:::

### Sliding Window Advertisement


**题目大意**：给定 `n` 根柱子的高度 `h[i]` 与窗口长度 `k`（$n \le 2 \times 10^5$），对每个长度为 `k` 的连续窗口，求只用窗口内这些柱子能围出的最大矩形面积。

**解题思路**：

- **观察**：最大矩形一定以窗口中某根柱子的高度为高。用单调栈求出每根柱子 `i` 的 `L[i]`（左边第一个高度严格小于 `h[i]` 的柱子，不存在时为 -1）与 `R[i]`（右边第一个高度不大于 `h[i]` 的柱子，不存在时为 `n`），于是 `h[i]` 可以作高的最长区间是 $[L[i]+1,\ R[i]-1]$——等高时统一归最左边那根柱子所有，不会重复计算。

- **做法**：每个窗口由起点 `l` 决定（$0 \le l \le X = n-k$）。柱子 `i` 能进入的窗口起点范围是 $[\max(0,\ i-k+1),\ \min(i,\ X)]$；在这个范围内，窗口与区间 $[L[i]+1,\ R[i]-1]$ 的交宽 $w$ 随 `l` 分段线性变化，按 `l` 与 `L[i]`、`R[i]-k` 的大小关系分成四段，斜率依次为 $+1$、$0$、$0$、$-1$，每段都是一条关于 `l` 的直线 $h[i] \cdot w$。把这四条直线用 Li Chao 树区间插入登记到对应的 `l` 区间上，最后对每个 `l` 单点查询所有直线的最大值即为该窗口的答案。

- **正确性**：任一窗口内的最大矩形必以某根柱子 `i` 为高，其宽度被窗口与 $[L[i]+1,\ R[i]-1]$ 同时限制，就是 $w(l)$；四段划分覆盖了 `l` 的全部取值，因此查询取到的最大值就是该窗口的最大矩形面积。总时间复杂度为 $O(n \log^2 n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const ll NEG = -4e18;
struct Line {
    ll a, b;
    Line(ll a = 0, ll b = NEG) : a(a), b(b) {}
};
ll f(Line L, ll x) { return L.a * x + L.b; }
const int MAXN = 200005;
Line tr[4 * MAXN];
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
    if (qr < l || r < ql || ql > qr)
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
    int n, k;
    cin >> n >> k;
    vector<ll> h(n);
    for (auto& v : h) cin >> v;

    vector<int> L(n, -1), R(n, n);
    vector<int> st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && h[st.back()] >= h[i]) st.pop_back();
        L[i] = st.empty() ? -1 : st.back();
        st.push_back(i);
    }
    st.clear();
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && h[st.back()] > h[i]) st.pop_back();
        R[i] = st.empty() ? n : st.back();
        st.push_back(i);
    }
    int X = n - k;
    for (int i = 0; i < 4 * MAXN; i++) tr[i] = Line();
    for (int i = 0; i < n; i++) {
        int lo = max(0, i - k + 1), hi = min(i, X);
        if (lo > hi)
            continue;
        ll H = h[i];

        int e1 = min(hi, min(L[i], R[i] - k));
        if (lo <= e1)
            addRange(1, 0, X, lo, e1, Line(H, H * (k - L[i] - 1)));

        int s3 = max(lo, R[i] - k + 1), e3 = min(hi, L[i]);
        if (s3 <= e3)
            addRange(1, 0, X, s3, e3, Line(0, H * (R[i] - L[i] - 1)));

        int s2 = max(lo, L[i] + 1), e2 = min(hi, R[i] - k);
        if (s2 <= e2)
            addRange(1, 0, X, s2, e2, Line(0, H * k));

        int s4 = max(lo, max(L[i], R[i] - k) + 1);
        if (s4 <= hi)
            addRange(1, 0, X, s4, hi, Line(-H, H * R[i]));
    }
    for (int l = 0; l <= X; l++) cout << qry(1, 0, X, l) << ' ';
    cout << '\n';
}
```

:::
