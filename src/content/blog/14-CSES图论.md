---
title: "CSES 图论"
description: "本篇包含：Graph Algorithms（36 题）、Advanced Graph Problems（28 题）。共 64 题。"
pubDate: 2026-05-03T21:00:00+08:00
tags: ["CSES"]
categories: ["Algorithm"]
cover: "/img/14.jpg"
---
本篇包含：Graph Algorithms（36 题）、Advanced Graph Problems（28 题）。共 64 题。



## Graph Algorithms

### Counting Rooms


**题目大意**：给定一张 $n \times m$ 的地图（$n, m \le 1000$），其中 `#` 表示墙，`.` 表示地板。只能在地板格之间上下左右移动，求地图中四方向连通的地板区域数量，也就是房间数。

**解题思路**：遍历地图，每遇到仍为 `.` 的 `building[i][j]` 就发现了一个新房间，`n_rooms` 加 1，并从该格把整个连通块吞掉：地板入栈时就改成 `#`（就地标记），出栈时向四个方向扩展。每个格子至多进栈一次。时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。**这里必须用显式栈**：一个房间最大可达 $10^6$ 格，递归 DFS 的栈深就等于地板格总数，一定会爆栈。

:::details[题解(C++)]

```c++
const int MN = 1001;
string building[MN];
int n, m;

void solve() {
    cin >> n >> m;
    for (int i = 0; i < n; ++i) {
        cin >> building[i];
    }

    const int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};
    int n_rooms = 0;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            if (building[i][j] != '.')
                continue;
            ++n_rooms;
            vector<pair<int, int>> st{{i, j}};   // 显式栈：房间最大 1e6 格，递归必然爆栈
            building[i][j] = '#';
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int d = 0; d < 4; ++d) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nr < n && nc >= 0 && nc < m && building[nr][nc] == '.') {
                        building[nr][nc] = '#';  // 入栈时就标记，避免同一格被重复压入
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
    cout << n_rooms << '\n';
}
```

:::

### Labyrinth


**题目大意**：给定一张 $n \times m$ 的迷宫（$n, m \le 1000$），`A` 是起点，`B` 是终点，`#` 是墙。每一步可以上下左右移动到非墙格，要求判断能否从 `A` 到达 `B`；若可以，还要输出一条最短路径的长度及由 `L`、`R`、`U`、`D` 组成的移动序列。

**解题思路**：无权网格最短路用 BFS：从起点 `a` 入队逐层扩展，格子首次被访问时走过的步数就是到它的最少步数。`visited[i][j]` 标记已访问，`previous[i][j]` 记录该格的前驱，`last_letter[i][j]` 记录从前驱走到这里的移动方向（取自 `moves` 表）。若终点 `b` 未被访问则输出 `NO`；否则从 `b` 沿 `previous` 回溯到 `a` 收集 `last_letter` 并反转，得到正向路径，先输出长度 `ans.size()` 再输出方向串。时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
const int N = 1001;
string grid[N];
bool visited[N][N];
pair<int, int> previous[N][N];
char last_letter[N][N];

tuple<int, int, char> moves[]{
    {0, 1, 'R'}, {1, 0, 'D'}, {0, -1, 'L'}, {-1, 0, 'U'}};

void solve() {
    int n, m;
    cin >> n >> m;

    pair<int, int> a;
    pair<int, int> b;
    for (int i = 0; i < n; ++i) {
        cin >> grid[i];
        for (int j = 0; j < m; ++j) {
            if (grid[i][j] == 'A')
                a = {i, j};
            if (grid[i][j] == 'B')
                b = {i, j};
        }
    }

    queue<pair<int, int>> queue;
    queue.push(a);
    visited[a.first][a.second] = true;

    while (!queue.empty()) {
        auto [r, c] = queue.front();
        queue.pop();
        for (auto [delta_r, delta_c, letter] : moves) {
            int new_r = r + delta_r;
            int new_c = c + delta_c;
            if (new_r >= 0 && new_r < n && new_c >= 0 && new_c < m) {
                if (grid[new_r][new_c] == '#')
                    continue;
                if (visited[new_r][new_c])
                    continue;
                visited[new_r][new_c] = true;
                previous[new_r][new_c] = {r, c};
                last_letter[new_r][new_c] = letter;
                queue.emplace(new_r, new_c);
            }
        }
    }

    if (!visited[b.first][b.second]) {
        cout << "NO\n";
        return;
    }
    string ans;
    auto pos = b;
    while (pos != a) {
        auto [r, c] = pos;
        ans += last_letter[r][c];
        pos = previous[r][c];
    }
    reverse(ans.begin(), ans.end());
    cout << "YES\n";
    cout << ans.size() << '\n';
    cout << ans << '\n';
}
```

:::

### Building Roads


**题目大意**：有 `n` 个城市和 `m` 条双向道路（$n \le 10^5$，$m \le 2 \times 10^5$）。可以在任意两个城市之间新建道路，要求用最少的新道路使所有城市互相可达，并输出道路数量及一种具体方案。

**解题思路**：设原图有 `k` 个连通块。一条新路至多合并两个连通块，故至少需要 $k-1$ 条；把各连通块的代表点依次连成一条链恰好用 $k-1$ 条，下界可达。用并查集读入道路时执行 `merge(u, v)`，再把每个城市的根 `get(i)` 放入 `set` 去重；`s.size() - 1` 即最少道路数，把 `set` 中相邻的代表点依次相连即得方案。时间复杂度为 $O((n+m)\alpha(n)+n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 5;

int n, m;
int fa[N];
int get(int u) {
    if (fa[u] == u)
        return u;
    return fa[u] = get(fa[u]);
}
void merge(int v, int u) { fa[get(v)] = get(u); }
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) fa[i] = i;
    while (m--) {
        int u, v;
        cin >> u >> v;
        merge(u, v);
    }
    set<int> s;
    for (int i = 1; i <= n; i++) s.insert(get(i));
    auto it = s.begin();
    it++;
    cout << s.size() - 1 << '\n';
    for (; it != s.end(); it++) {
        auto iq = it;
        iq--;
        cout << *iq << ' ' << *it << '\n';
    }
}
```

:::

### Message Route


**题目大意**：`n` 台电脑、`m` 条双向网线连接（$n \le 10^5$，$m \le 2 \times 10^5$）。问能否从 1 号走到 `n` 号，若能输出最短路径上的电脑数量以及路径上的电脑编号，否则输出 `IMPOSSIBLE`。

**解题思路**：从 1 号做 BFS，某节点首次入队时对应的步数就是它到 1 号的最短距离，`parent[y]` 记录首次到达 `y` 的前驱。若 `n` 未被访问则输出 `IMPOSSIBLE`；否则从 `n` 沿 `parent` 回溯收集路径——`parent[1]` 保持全局初值 0，作为回溯的终止标记——反转后先输出城市数量 `ans.size()` 再输出编号序列。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 5;

vector<int> graph[N];
bool visited[N];
int parent[N];

void solve() {
    int n, m;
    cin >> n >> m;

    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        graph[a].push_back(b);
        graph[b].push_back(a);
    }

    queue<int> queue;
    queue.push(1);
    visited[1] = true;

    while (!queue.empty()) {
        int x = queue.front();
        queue.pop();
        for (int y : graph[x]) {
            if (visited[y])
                continue;
            visited[y] = true;
            parent[y] = x;
            queue.push(y);
        }
    }

    if (!visited[n]) {
        cout << "IMPOSSIBLE\n";
        return;
    }

    vector<int> ans;
    int x = n;
    while (x != 0) {
        ans.push_back(x);
        x = parent[x];
    }
    reverse(ans.begin(), ans.end());

    cout << ans.size() << '\n';
    for (int x : ans) {
        cout << x << ' ';
    }
    cout << '\n';
}
```

:::

### Building Teams


**题目大意**：`n` 个学生、`m` 对朋友关系（$n \le 10^5$，$m \le 2 \times 10^5$），朋友之间不能分到同一队。问能否把所有人分成两队，能则输出每个学生的队号（1 或 2），否则输出 `IMPOSSIBLE`。

**解题思路**：学生为顶点、朋友关系为边，问题等价于判定这张图是否二分图，用二染色判定。对每个未访问的连通块从起点染 0 开始 DFS：相邻点染相反色 `color ^ 1`，枚举邻居时检查 `c[u] == c[v]`，一旦某条边两端同色就置 `f = 0`。全部染完后若 `f == 0` 输出 `IMPOSSIBLE`，否则颜色非 0 的学生输出 1、颜色为 0 的输出 2。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 5;

int n, m, c[N];
bool vis[N];
vector<int> G[N];
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) c[i] = -1, vis[i] = false;
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    int f = 1;
    function<void(int, int)> dfs = [&](int u, int color) {
        c[u] = color;
        vis[u] = true;
        for (auto v : G[u]) {
            if (!vis[v])
                dfs(v, color ^ 1);
            if (c[u] == c[v])
                f = 0;
        }
    };
    for (int i = 1; i <= n; i++) {
        if (!vis[i])
            dfs(i, 0);
    }
    if (f == 0) {
        cout << "IMPOSSIBLE" << '\n';
        return;
    }
    for (int i = 1; i <= n; i++) {
        if (c[i])
            cout << 1 << " ";
        else
            cout << 2 << " ";
    }
    cout << '\n';
}
```

:::

### Round Trip


**题目大意**：无向图（$n \le 10^5$，$m \le 2 \times 10^5$），找一条至少经过 3 个不同顶点、能回到起点的环，输出环上的顶点序列；不存在则输出 `IMPOSSIBLE`。

**解题思路**：

- **做法**：对每个未访问的连通块 DFS，`p[v]` 记录 DFS 树上 `v` 的父节点。搜索 `u` 的邻居 `v` 时跳过父节点；遇到其它已访问点就记录 `s = v`、`t = u` 并立即返回。还原环时先放入 `s`，再从 `t` 沿 `p[i]` 走回 `s`，末尾补一次 `s` 后反转，得到首尾相同的序列。

- **正确性**：无向图 DFS 中不存在横叉边，除父边外连向已访问点的边（返祖边）必连接当前点与它的某个 DFS 树祖先。由于父边被跳过，`v` 是 `u` 的真祖先，从 `t` 沿 `p` 走到 `s` 至少经过两条树边，因此围出的环至少含 3 个不同顶点，满足题目要求；回溯的每一步走的都是树边，路径必然存在。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 5;

int n, m;
vector<int> G[N];
int p[N], s, t;
bool vis[N];
int dfs(int u, int fa) {
    vis[u] = 1;
    for (auto v : G[u]) {
        if (v == fa)
            continue;
        if (vis[v]) {
            s = v;
            t = u;
            return true;
        }
        p[v] = u;
        if (dfs(v, u)) {
            return true;
        }
    }
    return false;
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    for (int i = 1; i <= n; i++) {
        if ((!vis[i]) && dfs(i, p[i])) {
            break;
        }
    }
    if (s == 0) {
        cout << "IMPOSSIBLE" << '\n';
    } else {
        vector<int> ans;
        ans.emplace_back(s);
        for (int i = t; i != s; i = p[i]) {
            ans.emplace_back(i);
        }
        ans.emplace_back(s);
        reverse(ans.begin(), ans.end());
        cout << ans.size() << '\n';
        for (auto i : ans) cout << i << " ";
        cout << '\n';
    }
}
```

:::

### Monsters


**题目大意**：给定一张 $n \times m$ 的迷宫（$n, m \le 1000$），其中 `A` 是玩家，`M` 是怪物，`#` 是墙。玩家和所有怪物每轮都可以上下左右移动一步。要求判断玩家能否在不与怪物同时到达同一格或更晚到达该格的前提下走到边界，并输出一条逃生路径。

**解题思路**：玩家能安全进入一个格子，当且仅当到达该格的时刻严格早于任意怪物最早到达它的时刻。先做多源 BFS：所有 `M` 同时入队，`tim[i][j]` 记录怪物最早到达时间（初值 `INF`，怪物所在格为 0）；玩家的起点也置 0，使它不会被再次进入。再从 `A` 出发 BFS，只把满足 `tim[nx][ny] > nt` 的格子入队（`nt` 是玩家的到达时刻），并用 `fa[nx][ny]` 记录前驱；玩家的到达时刻直接覆盖这些格子的 `tim`，相当于顺带完成了访问标记。首次扩展到边界格即可沿 `fa` 回溯，按相邻坐标差翻译成 `U`/`D`/`L`/`R` 再反转输出；起点本身已在边界时直接输出 `YES`。总时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
struct node {
    int x, y;
    int t;
};
int n, m, sx, sy;
int dx[4] = {0, 0, 1, -1};
int dy[4] = {1, -1, 0, 0};
char mp[1007][1007];
pair<int, int> fa[1007][1007];
int tim[1007][1007];
void solve() {
    cin >> n >> m;
    queue<node> q;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            tim[i][j] = INF;
            cin >> mp[i][j];
            if (mp[i][j] == 'M') {
                q.push({i, j, 0});
                tim[i][j] = 0;
            } else if (mp[i][j] == 'A') {
                sx = i;
                sy = j;
                tim[i][j] = 0;
            }
        }
    }
    if (sx == 1 || sy == 1 || sx == n || sy == m) {
        cout << "YES" << '\n';
        return;
    }
    while (!q.empty()) {
        node u = q.front();
        q.pop();
        for (int i = 0; i <= 3; i++) {
            int nx = u.x + dx[i];
            int ny = u.y + dy[i];
            int nt = u.t + 1;
            if (mp[nx][ny] == '#' || nx < 1 || ny < 1 || nx > n || ny > m ||
                tim[nx][ny] <= nt)
                continue;
            tim[nx][ny] = nt;
            q.push({nx, ny, nt});
        }
    }
    q.push({sx, sy, 0});
    while (!q.empty()) {
        node u = q.front();
        q.pop();
        for (int i = 0; i <= 3; i++) {
            int nx = u.x + dx[i];
            int ny = u.y + dy[i];
            int nt = u.t + 1;
            if (mp[nx][ny] == '#' || nx < 1 || ny < 1 || nx > n || ny > m ||
                tim[nx][ny] <= nt)
                continue;
            tim[nx][ny] = nt;
            fa[nx][ny] = {u.x, u.y};
            if (nx == 1 || nx == n || ny == 1 || ny == m) {
                cout << "YES" << '\n';
                cout << tim[nx][ny] << '\n';
                pair<int, int> t = {nx, ny};
                string w = "";
                while (true) {
                    if (t.first == sx && t.second == sy)
                        break;
                    string ss;
                    if (t.first - fa[t.first][t.second].first == 1)
                        ss = 'D';
                    if (t.first - fa[t.first][t.second].first == -1)
                        ss = 'U';
                    if (t.second - fa[t.first][t.second].second == 1)
                        ss = 'R';
                    if (t.second - fa[t.first][t.second].second == -1)
                        ss = 'L';
                    w.append(ss);
                    t = fa[t.first][t.second];
                }
                reverse(w.begin(), w.end());
                cout << w << '\n';
                return;
            }
            q.push({nx, ny, nt});
        }
    }
    cout << "NO" << '\n';
}
```

:::

### Shortest Routes I


**题目大意**：`n` 个城市、`m` 条单向航线（$n \le 10^5$，$m \le 2 \times 10^5$），每条从 `a` 到 `b`、费用 `c`。求从 1 号城市出发到每个城市的最短距离（不可达的城市距离保持初始极大值）。

**解题思路**：边权全为正，用 Dijkstra：小根堆（代码里是 `reverse_priority_queue`）存 `(距离, 节点)`，先把 `dist[1] = 0` 与状态 `(0, 1)` 入堆；每次取出 `(d, x)`，若 `dist[x] < d` 说明这是更新前的旧状态，直接跳过，否则枚举 `x` 的出边 `g[x]`，用 `d + len` 尝试更新 `dist[y]` 并把新状态入堆。距离用 `ll` 并以 $10^{18}$ 初始化。时间复杂度为 $O((n+m)\log m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
template <typename T>
using reverse_priority_queue = priority_queue<T, vector<T>, greater<T>>;
const int N = 100001;
vector<pair<int, int>> g[N];
ll dist[N];
void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        g[a].emplace_back(b, c);
    }

    for (int i = 1; i <= n; ++i) {
        dist[i] = 1e18;
    }

    reverse_priority_queue<pair<ll, int>> queue;
    queue.emplace(0, 1);
    dist[1] = 0;

    while (!queue.empty()) {
        auto [d, x] = queue.top();
        queue.pop();
        if (dist[x] < d)
            continue;
        for (auto [y, len] : g[x]) {
            ll new_d = d + len;
            if (new_d < dist[y]) {
                dist[y] = new_d;
                queue.emplace(new_d, y);
            }
        }
    }

    for (int i = 1; i <= n; ++i) {
        cout << dist[i] << ' ';
    }
    cout << '\n';
}
```

:::

### Shortest Routes II


**题目大意**：`n` 个城市（$n\le500$）、`m` 条双向航线，`q` 次询问（$q \le 10^5$）任意两点之间的最短距离，不可达输出 `-1`。

**解题思路**：$n\le500$，用 Floyd 一次求出任意两点最短距离。初始化 `f[i][i] = 0`、其余为 $10^{18}$；无向边同时更新两个方向并对重边取最小值。随后把中转点 `k` 放在最外层循环枚举，内层用
$$
f[i][j]=\min\bigl(f[i][j],\ f[i][k]+f[k][j]\bigr)
$$
更新。中转点必须在最外层，`f[i][k]` 与 `f[k][j]` 才会只用到编号不超过 `k` 的中转点，这正是递推所需的中间结果；同一层内没有顺序要求。询问时不可达者仍为 $10^{18}$，输出 `-1`。时间复杂度为 $O(n^3+q)$，空间复杂度为 $O(n^2)$。

:::details[题解(C++)]

```c++
ll n, m, q, f[505][505];
void fun() {
    for (int k = 1; k <= n; k++) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                f[i][j] = min(f[i][j], f[i][k] + f[k][j]);
            }
        }
    }
}
void solve() {
    cin >> n >> m >> q;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) {
            if (i == j)
                f[i][j] = 0;
            else
                f[i][j] = 1e18;
        }
    for (int i = 1; i <= m; i++) {
        ll u, v, w;
        cin >> u >> v >> w;
        f[u][v] = min(f[u][v], w);
        f[v][u] = min(f[v][u], w);
    }
    fun();
    while (q--) {
        int u, v;
        cin >> u >> v;
        if (f[u][v] == 1e18)
            cout << -1 << '\n';
        else
            cout << f[u][v] << '\n';
    }
}
```

:::

### High Score


**题目大意**：`n` 个房间、`m` 条单向隧道（$n \le 2500$，$m \le 5000$），每条隧道走过后分数变化可正可负，可以重复走同一条隧道。求从 1 号到 `n` 号能获得的最大分数；若分数可以无限增大（存在一个从 1 出发且能回到 `n` 路上的正权环）则输出 `-1`。

**解题思路**：

- **观察**：把边权 `x` 取反为 `-x`，最大得分问题就化为最小费用问题，原图中能无限增分的正环对应新图中的负环；只有位于「从 1 可达且还能到达 `n`」的路径上的负环才会影响答案。

- **做法**：分别在原图 `g` 与反图 `rev_g` 上从 1、`n` 做 BFS，两个可达集合按位与得到 `included`，即有效点集。Bellman-Ford 松弛 `n` 轮，每轮只松弛两端都在 `included` 中的边；`distance` 初值为 $10^{18}$、`distance[1] = 0`，若第 `n` 轮仍有一条边被严格松弛，说明有效路线中存在负环，输出 `-1`，否则答案为 `-distance[n]`。

- **正确性**：从 1 到 `n` 的路径上每个点都能被前缀到达、又能沿后缀到达 `n`，所以必定属于 `included`，剔除无效点不会漏掉有效负环；反过来，`included` 内的边起点仍从 1 可达，第 `n` 轮还能松弛就等价于这个子图内存在负环，因此与答案无关的负环不会被误判。时间复杂度为 $O(nm)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 2501;
bitset<N> bfs(int s, vector<vector<int>>& g) {
    bitset<N> visited;
    queue<int> q;
    q.push(s);
    visited[s] = true;
    while (!q.empty()) {
        int x = q.front();
        q.pop();
        for (int y : g[x]) {
            if (!visited[y]) {
                visited[y] = true;
                q.push(y);
            }
        }
    }
    return visited;
}
void solve() {
    int n, m;
    cin >> n >> m;

    vector<tuple<int, int, int>> edges;
    vector<vector<int>> g(n + 1);
    vector<vector<int>> rev_g(n + 1);

    for (int i = 1; i <= m; ++i) {
        int a, b, x;
        cin >> a >> b >> x;
        edges.emplace_back(a, b, -x);
        g[a].push_back(b);
        rev_g[b].push_back(a);
    }

    auto included = bfs(1, g) & bfs(n, rev_g);

    vector<ll> distance(n + 1, 1e18);
    distance[1] = 0;

    for (int i = 1; i <= n; ++i) {
        for (auto [from, to, score] : edges) {
            if (!included[from] || !included[to])
                continue;
            ll new_distance = min(distance[to], distance[from] + score);
            if (i == n && new_distance < distance[to]) {
                cout << -1 << '\n';
                return;
            }
            distance[to] = new_distance;
        }
    }
    cout << -distance[n] << '\n';
}
```

:::

### Flight Discount


**题目大意**：给定一张带正权的有向图（$n \le 10^5$，$m \le 2 \times 10^5$），从 1 号城市前往 `n` 号城市时可以对一张航班票使用折扣，使该边费用变为整数除法下的 `c / 2`。求最小总费用。

**解题思路**：

- **观察**：折扣「已用/未用」是一个二元状态，用分层图表示：第 1 层 `1..n` 表示尚未用掉折扣，第 2 层 `n+1..2n` 表示已经用过，两层的点一一对应。

- **做法**：对原边 `a -> b`（费用 `c`）加入三条边：两层内各一条原价边 `a -> b` 与 `n+a -> n+b`，以及从第 1 层跨到第 2 层的折扣边 `a -> n+b`（费用 `c/2`）。

- **正确性**：跨层边只从第 1 层指向第 2 层，任何路径至多用一次折扣；目标 `2n` 位于第 2 层，保证折扣已被使用，因此 `distance[2n]` 就是恰用一次折扣到达 `n` 的最小费用。用 Dijkstra 在该分层图上求最短路即可。时间复杂度为 $O((n+m)\log(n+m))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;

    vector<vector<pair<int, int>>> graph(2 * n + 1);

    for (int i = 1; i <= m; i++) {
        int a, b, c;
        cin >> a >> b >> c;
        graph[a].emplace_back(b, c);
        graph[n + a].emplace_back(n + b, c);
        graph[a].emplace_back(n + b, c / 2);
    }

    vector<ll> distance(2 * n + 1, 1e18);
    vector<bool> visited(2 * n + 1);

    priority_queue<pair<ll, int>> queue;
    queue.emplace(0, 1);
    distance[1] = 0;

    while (!queue.empty()) {
        int node = queue.top().second;
        queue.pop();

        if (visited[node])
            continue;
        visited[node] = true;

        for (auto [next_node, weight] : graph[node]) {
            ll new_distance = distance[node] + weight;
            if (new_distance < distance[next_node]) {
                distance[next_node] = new_distance;
                queue.emplace(-new_distance, next_node);
            }
        }
    }

    cout << distance[2 * n] << "\n";
}
```

:::

### Cycle Finding


**题目大意**：有向带权图（$n \le 2500$，$m \le 5000$），判断是否存在负环（边权和为负的环），若存在则输出其中一个负环的顶点序列。

**解题思路**：

- **做法**：把所有 `distance` 初始化为 0，这等价于增设一个向所有节点连零权边的超级源点，因而能检测图中任意位置上的负环。Bellman-Ford 松弛 `n` 轮，每轮遍历所有边 `edges`：能严格变小就更新 `distance[to]` 并记 `previous[to] = from`；第 `n` 轮仍被更新的节点记为 `path_end`，它或位于负环上、或可由负环到达。从 `path_end` 沿 `previous` 回退并记录访问标记，首次遇到重复节点时即找到了环；反转后从首节点输出到它再次出现为止，得到首尾相同的负环序列。

- **正确性**：松弛 `n` 轮后仍能更新的边，其起点必可由某个负环到达（否则最短距离在第 `n-1` 轮前就已收敛），而前驱链上只有 `n` 个不同节点，回退 `n` 步内必然重复，重复点及其间的一段就是负环。反之，若第 `n` 轮没有任何更新，则所有边都满足 `distance[to] <= distance[from] + len`，沿任一环求和得环权和非负，故不存在负环。时间复杂度为 $O(nm)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    vector<tuple<int, int, int>> edges;

    cin >> n >> m;
    for (int i = 1; i <= m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        edges.emplace_back(a, b, c);
    }

    vector<ll> distance(n + 1);
    vector<int> previous(n + 1);
    optional<int> path_end;

    for (int i = 1; i <= n; ++i) {
        for (auto [from, to, len] : edges) {
            ll new_distance = distance[from] + len;
            if (new_distance < distance[to]) {
                distance[to] = new_distance;
                previous[to] = from;
                if (i == n) {
                    path_end = to;
                }
            }
        }
    }

    if (!path_end) {
        cout << "NO\n";
        return;
    }

    vector<char> visited(n + 1);
    vector<int> path;
    int x = *path_end;
    while (true) {
        path.push_back(x);
        if (visited[x])
            break;
        visited[x] = 1;
        x = previous[x];
    }
    reverse(path.begin(), path.end());

    cout << "YES\n";
    for (int i = 0; i < path.size(); ++i) {
        cout << path[i] << ' ';
        if (i > 0 && path[i] == path.front())
            break;
    }
    cout << '\n';
}
```

:::

### Flight Routes


**题目大意**：求从 1 号到 `n` 号的前 `k` 条最短路长度（$n \le 10^5$，$m \le 2 \times 10^5$，$k \le 10$）。可以重复经过城市，走的路线不同就算不同（同一条边路径顺序不同也算不同）。

**解题思路**：

- **观察**：边权为正，小根堆弹出的顺序单调不减，节点第 `c` 次被有效弹出时，对应的路径长度就是到该节点的第 `c` 小路径长度。

- **做法**：不设布尔访问标记去重，而用 `visited[x]` 计数，限制每个节点至多扩展 `k` 次，已弹出 `k` 次的状态直接丢弃；起点状态 `(0, 1)` 入堆，弹到 `n` 时用 `dist[visited[n]] = d` 记下这一条（此时 `visited[n]` 还是自增前的值）。

- **正确性**：每条路径都以其终点状态入堆，弹出顺序递增，故节点第 `c` 次弹出对应第 `c` 短路径；每个节点只扩展前 `k` 次不影响前 `k` 短的发现——被丢弃的状态是该节点第 `k+1` 次及以后的弹出，由它们延伸出的路线都不短于已发现的那 `k` 条。至多扩展 $kn$ 个状态、扫描 $km$ 条边，总时间复杂度为 $O(km\log(kn+km))$，空间复杂度为 $O(n+m+km)$。

:::details[题解(C++)]

```c++
template <typename T>
using reverse_priority_queue = priority_queue<T, vector<T>, greater<T>>;
const int N = 100001;
const int K = 10;
vector<pair<int, int>> g[N];
int visited[N];
ll dist[K];

void solve() {
    int n, m, k;
    cin >> n >> m >> k;
    for (int i = 1; i <= m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        g[a].emplace_back(b, c);
    }

    reverse_priority_queue<pair<ll, int>> q;
    q.emplace(0, 1);

    while (!q.empty()) {
        auto [d, x] = q.top();
        q.pop();
        if (visited[x] >= k) {
            continue;
        }
        if (x == n) {
            dist[visited[x]] = d;
        }
        ++visited[x];
        for (auto [y, len] : g[x]) {
            q.emplace(d + len, y);
        }
    }

    for (int i = 0; i < k; ++i) {
        cout << dist[i] << ' ';
    }
    cout << '\n';
}
```

:::

### Round Trip II


**题目大意**：有向图（$n \le 10^5$，$m \le 2 \times 10^5$），找一条有向环并输出环上的顶点序列，不存在则输出 `IMPOSSIBLE`。

**解题思路**：对每个未访问节点做 DFS，用三色标记 `vis[u]`：0 表示未访问，1 表示正在递归栈中，2 表示已处理完。搜到边 `u -> v` 时：若 `vis[v] == 0` 则记 `p[v] = u` 并继续递归；若 `vis[v] == 1`，说明 `v` 是递归栈中的祖先，`v -> ... -> u -> v` 构成有向环，记录 `s = v`、`t = u` 并返回；`vis[v] == 2` 的边不可能围成环，直接跳过。还原时先放入 `s`，再从 `t` 沿 `p[i]` 走回 `s`，末尾补一次 `s` 后反转，输出首尾相同的顶点序列。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 5;
int n, m;
vector<int> G[N];
int p[N], s, t, vis[N];
int dfs(int u) {
    vis[u] = 1;
    for (auto v : G[u]) {
        if (vis[v] == 0) {
            p[v] = u;
            if (dfs(v))
                return true;
        } else if (vis[v] == 1) {
            s = v;
            t = u;
            return true;
        }
    }
    vis[u] = 2;
    return false;
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
    }
    for (int i = 1; i <= n; i++) {
        if ((!vis[i]) && dfs(i)) {
            break;
        }
    }
    if (s == 0) {
        cout << "IMPOSSIBLE" << '\n';
    } else {
        vector<int> ans;
        ans.emplace_back(s);
        for (int i = t; i != s; i = p[i]) {
            ans.emplace_back(i);
        }
        ans.emplace_back(s);
        reverse(ans.begin(), ans.end());
        cout << ans.size() << '\n';
        for (auto i : ans) cout << i << " ";
        cout << '\n';
    }
}
```

:::

### Course Schedule


**题目大意**：`n` 门课程、`m` 条先修关系（$n \le 10^5$，$m \le 2 \times 10^5$），每条 `a b` 表示必须先修完 `a` 才能修 `b`。求一个合法的学习顺序；若不存在（先修关系成环）则输出 `IMPOSSIBLE`。

**解题思路**：统计入度 `in_degree`（读到边 `a b` 时执行 `++in_degree[b]`），先把所有入度为 0 的课程依次存入队列 `no_incoming`；每次取出队首 `x`，对它的每条出边 `x -> y` 把 `in_degree[y]` 减 1，减到 0 就把 `y` 入队。取出的课程数不足 `n` 说明有环（先修关系矛盾），输出 `IMPOSSIBLE`；否则出队顺序就是一个合法的学习顺序。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve() {
    int n, m;
    cin >> n >> m;

    vector<int> in_degree(n + 1);
    vector<vector<int>> g(n + 1);

    for (int i = 1; i <= m; ++i) {
        int a, b;
        cin >> a >> b;
        ++in_degree[b];
        g[a].push_back(b);
    }

    vector<int> no_incoming;

    for (int i = 1; i <= n; ++i) {
        if (in_degree[i] == 0) {
            no_incoming.push_back(i);
        }
    }

    for (int i = 0; i < no_incoming.size(); ++i) {
        int x = no_incoming[i];
        for (int y : g[x]) {
            --in_degree[y];
            if (in_degree[y] == 0) {
                no_incoming.push_back(y);
            }
        }
    }

    if (no_incoming.size() < n) {
        cout << "IMPOSSIBLE\n";
        return;
    }

    for (int x : no_incoming) {
        cout << x << ' ';
    }
    cout << '\n';
}
```

:::

### Longest Flight Route


**题目大意**：`n` 个城市、`m` 条单向航线（$n \le 10^5$，$m \le 2 \times 10^5$），保证图是 DAG。求从 1 号到 `n` 号、经过城市最多的路径，输出经过的城市数和路径；若 1 号到不了 `n` 则输出 `IMPOSSIBLE`。

**解题思路**：DAG 上记忆化搜索。`longest[x]` 为从 `x` 到 `n` 的最长路径包含的城市数（含 `x` 本身），`next_city[x]` 记录最优后继，`ready[x]` 为记忆化标记，终点令 `longest[n] = 1`。求 `f(x)` 时枚举 `x` 的每条出边 `x -> y`：先递归求出 `f(y)`，若 `longest[y] + 1` 更大就更新 `longest[x]` 与 `next_city[x]`。DAG 无环使递归不会绕回自身；不能到达 `n` 的状态初值为 `-INF`、最终仍为负值，所以 `f(1) < 0` 时输出 `IMPOSSIBLE`，否则先输出 `f(1)`，再从 1 起沿 `next_city` 依次输出城市编号（走到默认值 0 为止）。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 100001;
vector<int> g[N];

bool ready[N];
int longest[N];
int next_city[N];
int n;

int f(int x) {
    if (ready[x])
        return longest[x];
    ready[x] = true;
    longest[x] = -INF;
    if (x == n) {
        return longest[x] = 1;
    }
    for (int y : g[x]) {
        f(y);
        if (longest[y] + 1 > longest[x]) {
            longest[x] = longest[y] + 1;
            next_city[x] = y;
        }
    }
    return longest[x];
}

void solve() {
    int m;
    cin >> n >> m;
    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
    }

    if (f(1) < 0) {
        cout << "IMPOSSIBLE\n";
        return;
    }

    cout << f(1) << '\n';
    int x = 1;
    while (x != 0) {
        cout << x << ' ';
        x = next_city[x];
    }
    cout << '\n';
}
```

:::

### Game Routes


**题目大意**：DAG 上（$n \le 10^5$，$m \le 2 \times 10^5$）从 1 号到 `n` 号一共有多少条不同路径，答案对 $10^9+7$ 取模。

**解题思路**：`dp[u]` 为从 1 到 `u` 的路径数，`dp[1] = 1`；`a[v]` 记录入度，入度为 0 的节点先入队。取出 `u` 时对每条边 `u -> v` 执行 `dp[v] = (dp[v] + dp[u]) % mod` 并把 `a[v]` 减 1，减到 0 就把 `v` 入队。拓扑序保证计算 `v` 时它的所有前驱都已贡献完毕；除 1 以外的入度为 0 的节点 `dp` 恒为 0，不会凭空多出路径。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 1e5 + 7;
const int mod = 1e9 + 7;
int n, m;
ll dp[N];
vector<int> G[N];
int a[N];
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        a[v]++;
        G[u].emplace_back(v);
    }
    dp[1] = 1;
    queue<int> q;
    for (int i = 1; i <= n; i++)
        if (!a[i])
            q.push(i);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (auto v : G[u]) {
            a[v]--;
            dp[v] = (dp[u] + dp[v]) % mod;
            if (a[v] == 0) {
                q.push(v);
            }
        }
    }
    cout << dp[n] << '\n';
}
```

:::

### Investigation


**题目大意**：从 1 号到 `n` 号（$n \le 10^5$，$m \le 2 \times 10^5$），求四个量：最小花费、达到最小花费的路径条数、这些最短路径中航班数最少的一种有多少班、最多的一种有多少班（条数对 $10^9+7$ 取模）。

**解题思路**：

- **观察**：边 $x\to y$（费用 `len`）落在某条从 `x` 到 `n` 的最短路上，当且仅当 `price[x] == price[y] + len`，其中 `price[v]` 是 `v` 到 `n` 的最短费用。从 1 出发只沿满足该等式的边递归，走过的就恰好是所有 1 到 `n` 的最短路；`price` 沿这些边严格递减，因此子图无环。

- **做法**：先在反图 `rev_g` 上从 `n` 跑 Dijkstra 得到 `price`。再从 1 号做记忆化搜索 `f`（`ready[x]` 标记），只按上面的等式转移：`n_min_price[x]` 累加最短路条数（对 $10^9+7$ 取模），`min_flights[x]`、`max_flights[x]` 分别取后继值加 1 后的最小、最大值；终点 `n` 的这三个量预置为 1、0、0。

- **正确性**：每条 1 到 `n` 的最短路按最后一条边分解，去掉末边后仍是到该边起点的最短路，故递归能枚举到全部最短路且不重不漏；`price` 严格递减保证递归有限步终止于 `n`。输出依次为 `price[1]`、`n_min_price[1]`、`min_flights[1]`、`max_flights[1]`。总时间复杂度为 $O((n+m)\log m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
template <typename T>
using reverse_priority_queue = priority_queue<T, vector<T>, greater<T>>;

const int N = 2e5 + 5;
const int MOD = 1e9 + 7;

vector<pair<int, int>> g[N];
vector<pair<int, int>> rev_g[N];
ll price[N];
int n;

bool ready[N];
ll n_min_price[N];
ll min_flights[N];
ll max_flights[N];

void f(int x) {
    if (ready[x])
        return;
    ready[x] = true;
    if (x == n) {
        n_min_price[x] = 1;
        min_flights[x] = 0;
        max_flights[x] = 0;
        return;
    }
    n_min_price[x] = 0;
    min_flights[x] = INFLL;
    max_flights[x] = -INFLL;
    for (auto [y, len] : g[x]) {
        if (price[x] == price[y] + len) {
            f(y);
            n_min_price[x] = (n_min_price[x] + n_min_price[y]) % MOD;
            min_flights[x] = min(min_flights[x], min_flights[y] + 1);
            max_flights[x] = max(max_flights[x], max_flights[y] + 1);
        }
    }
}

void solve() {
    int m;
    cin >> n >> m;
    for (int i = 0; i < m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        g[a].emplace_back(b, c);
        rev_g[b].emplace_back(a, c);
    }

    fill(price, price + n + 1, INFLL);

    reverse_priority_queue<pair<ll, int>> queue;
    queue.emplace(0, n);
    price[n] = 0;

    while (!queue.empty()) {
        auto [d, x] = queue.top();
        queue.pop();
        if (d > price[x])
            continue;
        for (auto [y, len] : rev_g[x]) {
            ll new_d = d + len;
            if (new_d < price[y]) {
                price[y] = new_d;
                queue.emplace(new_d, y);
            }
        }
    }

    f(1);

    cout << price[1] << ' ' << n_min_price[1] << ' ';
    cout << min_flights[1] << ' ' << max_flights[1] << '\n';
}
```

:::

### Planets Queries I


**题目大意**：`n` 个星球（$n, q \le 2 \times 10^5$），每个星球有一个传送目的地（可能指向自己），`q` 次询问：从 `x` 出发恰好传送 `k` 次后到达哪个星球。

**解题思路**：倍增。`a[i][j]` 为从星球 `i` 出发传送 $2^j$ 次后到达的位置，`a[i][0]` 就是一次传送的目的地，且
$$
a[i][j]=a[a[i][j-1]][j-1]
$$
预处理到 $j=31$。询问时按 `k` 的二进制位从低到高处理：当前位为 1 就执行 `x = a[x][i]`，随后 `k` 右移、`i` 递增，把二进制为 1 的那些位对应的跳跃依次拼接起来，就恰好走了 `k` 步。预处理时间复杂度为 $O(n\log K)$，总时间复杂度为 $O((n+q)\log K)$，空间复杂度为 $O(n\log K)$（$K$ 为询问中步数的上界）。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;
int n, q;
int a[N][32];
void solve() {
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i][0];
    for (int j = 1; j <= 31; j++) {
        for (int i = 1; i <= n; i++) {
            a[i][j] = a[a[i][j - 1]][j - 1];
        }
    }
    while (q--) {
        int x, k;
        cin >> x >> k;
        int i = 0;
        while (k) {
            if (k & 1)
                x = a[x][i];
            k >>= 1;
            i++;
        }
        cout << x << '\n';
    }
}
```

:::

### Planets Queries II


**题目大意**：`n` 个星球、每个星球指向一个传送目的地（$n, q \le 2 \times 10^5$），`q` 次询问从 `a` 传送到 `b` 至少要多少次，不可达输出 `-1`。

**解题思路**：

- **观察**：每个点出度为 1 的图（函数图）的每个弱连通块由一个环和若干指向环的树组成；`a` 能到达 `b` 当且仅当 `b` 在 `a` 沿传送边一直走（入环后沿环绕行）的路径上，所需的步数就是答案。

- **做法**：`extract_cycle(x)` 用快慢指针（`a` 每步走 1 条边、`b` 每步走 2 条边）先找到环上的一个汇合点，再沿 `teleport` 绕行一周把全部环节点依次存入 `cycle`，取 `cycle[0]` 作为入口。预处理：对 $j\ge1$ 置 `depth[cycle[j]] = -j`。随后从 `cycle[0]` 出发沿反图 `rev_graph` DFS：进入节点 `x` 时把深度记作 `d`（入口为 0、反向子节点为 `d + 1`），先回答挂在 `x` 上的询问——若 `depth[b] > -INF`，说明 `b` 在 `x` 的可达路径上，答案为 `depth[x] - depth[b]`，否则答案为 `-1`——再递归全部未访问的反向子节点，返回时把 `depth[x]` 恢复为进入前的值。整个连通块处理完后再把环节点深度复位为 `-INF`，使各连通块互不影响。

- **正确性**：反图 DFS 从 `cycle[0]` 出发先沿环逆向前进，依次覆盖 `cycle[k-1], cycle[k-2], \dots, cycle[1]`（$k$ 为环长），到达 `cycle[j]` 时 DFS 深度恰为 $k-j$；此时尚未覆盖的 `cycle[m]`（$m<j$）仍保留预置深度 $-m$，相减得 $(k-j)+m$，正是从 `cycle[j]` 沿传送方向绕过 `cycle[0]` 到 `cycle[m]` 的步数，而已覆盖的 `cycle[m]`（$m>j$）相减得 $m-j$，即沿环直接前进的步数。树上的点挂在各自前驱的反向子表中，DFS 深度逐层加 1，深度差就是沿传送方向的距离。`dfs` 返回时把 `depth[x]` 恢复为进入前的值（树上点恢复为 `-INF`、环节点恢复为 $-j$），所以已经退出搜索的树枝不会干扰其它节点的判定：`depth[b] > -INF` 恰好等价于 `b` 在 `x` 的可达路径上。每个点、每条询问只处理常数次，总时间复杂度为 $O(n+q)$，空间复杂度为 $O(n+q)$。

:::details[题解(C++)]

```c++
const int N = 200001;
int teleport[N];
vector<int> rev_graph[N];
int answer[N];
vector<pair<int, int>> queries[N];
int depth[N];
bool visited[N];

vector<int> extract_cycle(int x) {
    int a = x;
    int b = teleport[x];
    while (a != b) {
        a = teleport[a];
        b = teleport[teleport[b]];
    }
    vector<int> cycle;
    do {
        a = teleport[a];
        cycle.push_back(a);
    } while (a != b);
    return cycle;
}

void dfs(int x, int d) {
    visited[x] = true;
    int previous_depth = depth[x];
    depth[x] = d;
    for (auto [b, id] : queries[x]) {
        if (depth[b] > -INF) {
            answer[id] = d - depth[b];
        } else {
            answer[id] = -1;
        }
    }
    for (int y : rev_graph[x]) {
        if (!visited[y]) {
            dfs(y, d + 1);
        }
    }
    depth[x] = previous_depth;
}

void solve() {
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; ++i) {
        int t;
        cin >> t;
        teleport[i] = t;
        rev_graph[t].push_back(i);
        depth[i] = -INF;
    }
    for (int i = 1; i <= q; ++i) {
        int a, b;
        cin >> a >> b;
        queries[a].emplace_back(b, i);
    }

    for (int i = 1; i <= n; ++i) {
        if (!visited[i]) {
            auto cycle = extract_cycle(i);
            for (int j = 1; j < cycle.size(); ++j) {
                depth[cycle[j]] = -j;
            }
            dfs(cycle[0], 0);
            for (int j = 1; j < cycle.size(); ++j) {
                depth[cycle[j]] = -INF;
            }
        }
    }

    for (int i = 1; i <= q; ++i) {
        cout << answer[i] << '\n';
    }
}
```

:::

### Planets Cycles


**题目大意**：有 `n` 个星球（$n \le 2 \times 10^5$），每个星球都有唯一的传送目的地。对每个起点，求从它开始不断传送时，在第一次再次到达已经出现过的星球之前，一共会经过多少个不同星球。

**解题思路**：

- **观察**：每个点出度恰为 1 的函数图，其每个弱连通块由一个环和若干指向环的树组成；从环节点出发会走完整圈环，答案为环长；从树上节点出发，答案为「到环的步数 + 环长」。

- **做法**：`find_cycle` 用快慢指针定位环，统计环长 `size` 并把环上节点标记为 `cycle[x]`。从环上节点沿反图 `rev_graph` DFS：令 `answer[x] = parent_answer`，`x` 不在环上时再自增 1，然后以 `answer[x]` 递归全部反向子节点，离环越远答案逐层加 1；已访问的点直接返回。

- **正确性**：从 `find_cycle` 返回的环节点出发沿反图扩散，正是「到环距离」逐层加一的方向；传送目的地唯一，所以每个非环节点在反图搜索树上的父节点就是它的传送目的地，`answer[y] = answer[x] + 1` 恰好对应「先走完到环的 `d` 个树上点，再绕环一周」，也就是经过 $d$ 与环长之和个不同星球后才首次重复。每个节点只访问一次，时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 200001;

int teleporter[N];
vector<int> rev_graph[N];
bool cycle[N];
bool visited[N];
int answer[N];

pair<int, int> find_cycle(int x) {
    int a = x;
    int b = teleporter[x];
    while (a != b) {
        a = teleporter[a];
        b = teleporter[teleporter[b]];
    }
    int size = 0;
    do {
        ++size;
        cycle[a] = true;
        a = teleporter[a];
    } while (a != b);
    return {a, size};
}

void dfs(int x, int parent_answer) {
    if (visited[x])
        return;
    visited[x] = true;
    answer[x] = parent_answer;
    if (!cycle[x])
        ++answer[x];
    for (int y : rev_graph[x]) {
        dfs(y, answer[x]);
    }
}

void solve() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; ++i) {
        cin >> teleporter[i];
        rev_graph[teleporter[i]].push_back(i);
    }

    for (int i = 1; i <= n; ++i) {
        if (!visited[i]) {
            auto [x, size] = find_cycle(i);
            dfs(x, size);
        }
    }

    for (int i = 1; i <= n; ++i) {
        cout << answer[i] << ' ';
    }
    cout << '\n';
}
```

:::

### Road Reparation


**题目大意**：`n` 个城市、`m` 条可以修复的道路（$n \le 10^5$，$m \le 2 \times 10^5$），每条有修复费用。求让所有城市连通所需的最小总费用；无法连通则输出 `IMPOSSIBLE`。

**解题思路**：用 Kruskal 求最小生成树。把道路按费用升序排序，用并查集维护连通性：若一条路两端已属同一连通块就跳过（加入会成环），否则执行 `unite` 合并并把费用累加进 `cost`。扫描结束后若 `sz[find(1)] != n`，说明 1 号所在连通块没有覆盖全部城市，输出 `IMPOSSIBLE`；否则输出 `cost`。时间复杂度为 $O(m\log m+m\alpha(n))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 100001;

int sz[N];
int links[N];

int find(int x) {
    if (links[x] == x) {
        return x;
    }
    return links[x] = find(links[x]);
}

bool same(int x, int y) { return find(x) == find(y); }

void unite(int x, int y) {
    x = find(x);
    y = find(y);
    if (sz[x] < sz[y]) {
        swap(x, y);
    }
    sz[x] += sz[y];
    links[y] = x;
}

void solve() {
    int n, m;
    cin >> n >> m;

    fill(sz, sz + n + 1, 1);
    iota(links, links + n + 1, 0);

    vector<tuple<int, int, int>> edges;
    for (int i = 0; i < m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        edges.emplace_back(a, b, c);
    }

    sort(edges.begin(), edges.end(),
         [](auto x, auto y) { return get<2>(x) < get<2>(y); });

    ll cost = 0;
    for (auto [a, b, c] : edges) {
        if (!same(a, b)) {
            unite(a, b);
            cost += c;
        }
    }

    if (sz[find(1)] != n) {
        cout << "IMPOSSIBLE\n";
        return;
    }

    cout << cost << '\n';
}
```

:::

### Road Construction


**题目大意**：一开始 `n` 个城市两两不连通（$n \le 10^5$）。之后 `m` 天（$m \le 2 \times 10^5$）每天会加入一条新的路（连接两个城市），输出每天之后的连通块个数以及最大连通块的大小。

**解题思路**：初始每座城市单独成块：`n_components = n`、`largest_size = 1`。每天读入道路 `(a, b)`：两端根相同则两个统计量都不变；否则按大小合并 `unite(a, b)`，`n_components` 减 1，并用合并后根的大小 `sz[find(a)]` 更新 `largest_size`，随后输出这两个量。时间复杂度为 $O((n+m)\alpha(n))$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 100001;

int sz[N];
int fa[N];

int find(int x) {
    if (fa[x] == x) {
        return x;
    }
    return fa[x] = find(fa[x]);
}

bool same(int x, int y) { return find(x) == find(y); }

void unite(int x, int y) {
    x = find(x);
    y = find(y);
    if (sz[x] < sz[y]) {
        swap(x, y);
    }
    sz[x] += sz[y];
    fa[y] = x;
}

void solve() {
    int n, m;
    cin >> n >> m;

    fill(sz, sz + n + 1, 1);
    iota(fa, fa + n + 1, 0);

    int n_components = n;
    int largest_size = 1;

    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        if (!same(a, b)) {
            unite(a, b);
            --n_components;
            largest_size = max(sz[find(a)], largest_size);
        }
        cout << n_components << ' ' << largest_size << '\n';
    }
}
```

:::

### Flight Routes Check


**题目大意**：有向图（$n \le 10^5$，$m \le 2 \times 10^5$），判断是否任意两点都能互相到达（即整张图强连通）；否则输出任意一对不可达的 `(a,b)`。

**解题思路**：整张图强连通，当且仅当 1 号能到达所有点、且所有点都能到达 1 号（有了这两条，任意两点 $x\to y$ 都能经 $x\to1\to y$ 中转）。分别从 1 在原图 `g` 与反图 `rev_g` 上 DFS：`visited1[i]` 为假说明 1 到不了 `i`，输出 `1 i`；`visited2[i]` 为假说明原图中 `i` 到不了 1，输出 `i 1`；全部为真则输出 `YES`。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 100001;

vector<int> g[N];
vector<int> rev_g[N];

bool visited1[N];
bool visited2[N];

void dfs1(int x) {
    if (visited1[x])
        return;
    visited1[x] = true;
    for (int y : g[x]) {
        dfs1(y);
    }
}

void dfs2(int x) {
    if (visited2[x])
        return;
    visited2[x] = true;
    for (int y : rev_g[x]) {
        dfs2(y);
    }
}

void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        rev_g[v].push_back(u);
    }
    dfs1(1);
    dfs2(1);
    for (int i = 1; i <= n; i++) {
        if (!visited1[i]) {
            cout << "NO" << '\n';
            cout << 1 << " " << i << '\n';
            return;
        }
        if (!visited2[i]) {
            cout << "NO" << '\n';
            cout << i << " " << 1 << '\n';
            return;
        }
    }
    cout << "YES" << '\n';
}
```

:::

### Planets and Kingdoms


**题目大意**：有向图中（$n \le 10^5$，$m \le 2 \times 10^5$），两个点在同一“王国”当且仅当它们互相可达。求强连通分量（SCC）的个数，以及每个点所属的分量编号。

**解题思路**：

- **做法**：第一遍在原图 `graph` 上 DFS，节点在递归返回时压入 `order`，得到完成时间递增的序列；把它反转后按完成时间从大到小的顺序在反图 `graph_rev` 上 DFS，遇到还没有 `component` 编号的点就新开一个编号 `count`，把从它出发在反图上能到达的所有未编号点都赋成这个编号。

- **正确性**：若原图中存在从分量 $A$ 指向分量 $B$ 的边，则 $A$ 中所有点都比 $B$ 中所有点更晚完成，所以完成时间最大的点必落在某个没有入边分量的「源」SCC 中；在反图里该分量没有指向其它分量的出边，从它出发的 DFS 恰好只走完这一个 SCC，剩下的点重复同样的论证即可逐个剥离。两遍 DFS 各扫描一次图，时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
vector<vector<int>> graph;
vector<vector<int>> graph_rev;

vector<int> order;
vector<int> seen;

void find_order(int node) {
    if (seen[node])
        return;
    seen[node] = 1;
    for (auto next_node : graph[node]) {
        find_order(next_node);
    }
    order.push_back(node);
}

vector<int> component;

void find_component(int node, int id) {
    if (component[node])
        return;
    component[node] = id;
    for (auto next_node : graph_rev[node]) {
        find_component(next_node, id);
    }
}

void solve() {
    int n, m;
    cin >> n >> m;

    graph.resize(n + 1);
    graph_rev.resize(n + 1);

    for (int i = 1; i <= m; i++) {
        int a, b;
        cin >> a >> b;
        graph[a].push_back(b);
        graph_rev[b].push_back(a);
    }

    seen.resize(n + 1);
    for (int i = 1; i <= n; i++) {
        find_order(i);
    }

    reverse(order.begin(), order.end());
    int count = 0;
    component.resize(n + 1);
    for (auto node : order) {
        if (component[node])
            continue;
        count++;
        find_component(node, count);
    }

    cout << count << "\n";
    for (int i = 1; i <= n; i++) {
        cout << component[i] << " ";
    }
    cout << "\n";
}
```

:::

### Giant Pizza


**题目大意**：有 `n` 个顾客和 `m` 种配料（$n, m \le 10^5$）。每位顾客提出两个愿望，`+ x` 表示希望加入配料 `x`，`- x` 表示希望不加入配料 `x`；每位顾客的两个愿望至少要满足一个。求一种可行的配料方案，或判断无解。

**解题思路**：

- **观察**：对配料 `x`，节点 `x` 表示“加入”（$+x$）、节点 `x+m` 表示“不加入”（$-x$），二者互为否定。子句 $(A\lor B)$ 等价于两条蕴含边 $\neg A\to B$ 与 $\neg B\to A$，于是每位顾客对应两条边，全部约束就是一张蕴含图。

- **做法**：建图后跑 Tarjan 求 SCC：用 `num` 记录 DFS 序、`low` 记录子树内能到达的最小 DFS 序，`low[u] == num[u]` 时把栈中节点逐个弹出作为一个分量。若存在配料使 `sccno[x] == sccno[x + m]`，说明 $+x$ 与 $-x$ 互相蕴含，输出 `IMPOSSIBLE`；否则逐配料按 `sccno[x] < sccno[x + m]` 输出对应的加入/不加入选择。

- **正确性**：Tarjan 给分量编号的顺序保证对每条蕴含边 $u\to v$ 都有 `sccno[u] > sccno[v]`（$v$ 所在分量先出栈；若二者同属一个分量则取值必然相同，不会构成「真蕴含假」）。取 $val(x)$ 为真当且仅当 `sccno[x] < sccno[x + m]`，若某条蕴含边 $u\to v$ 被赋成「真蕴含假」，由 $val$ 的定义以及 $\neg B\to A$、$\neg A\to B$ 两条蕴含边的编号关系可得 $\text{sccno}[A] > \text{sccno}[\neg A] > \text{sccno}[B] > \text{sccno}[\neg B] > \text{sccno}[A]$，矛盾，故所有蕴含边都被满足，全部子句随之满足。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;
char a, b;
int x, y;
vector<int> G[N];
int cnt, n, m;
int low[N], num[N], dfn;
int sccno[N], st[N], top;
vector<int> scc[N];
void dfs(int u) {
    st[top++] = u;
    low[u] = num[u] = ++dfn;
    for (auto i : G[u]) {
        int v = i;
        if (!num[v]) {
            dfs(v);
            low[u] = min(low[u], low[v]);
        } else if (!sccno[v]) {
            low[u] = min(low[u], num[v]);
        }
    }
    if (low[u] == num[u]) {
        cnt++;
        while (1) {
            int v = st[--top];
            sccno[v] = cnt;
            scc[cnt].push_back(v);
            if (u == v)
                break;
        }
    }
}
void tarjan(int n) {
    cnt = top = dfn = 0;
    memset(sccno, 0, sizeof(sccno));
    memset(num, 0, sizeof(num));
    memset(low, 0, sizeof(low));
    for (int i = 1; i <= n; i++) {
        if (!num[i])
            dfs(i);
    }
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        cin >> a >> x >> b >> y;
        int A, A_, B, B_;
        if (a == '+') {
            A = x;
            A_ = x + m;
        } else {
            A = x + m;
            A_ = x;
        }
        if (b == '+') {
            B = y;
            B_ = y + m;
        } else {
            B = y + m;
            B_ = y;
        }
        G[A_].emplace_back(B);
        G[B_].emplace_back(A);
    }
    tarjan(2 * m);
    for (int i = 1; i <= m; i++) {
        if (sccno[i] == sccno[i + m]) {
            cout << "IMPOSSIBLE" << '\n';
            return;
        }
    }
    for (int i = 1; i <= m; i++) {
        if (sccno[i] < sccno[i + m])
            cout << "+" << " ";
        else
            cout << "-" << " ";
    }
}
```

:::

### Coin Collector


**题目大意**：有向图里（$n \le 10^5$，$m \le 2 \times 10^5$）每个房间有一定数量金币，可以任选起点和终点、沿有向边前进，经过的房间金币都会被收集（每个房间至多收集一次）。求最多能收集多少金币。

**解题思路**：

- **观察**：同一 SCC 内的点互相可达，一旦进入就能收完该分量的全部金币；把每个 SCC 缩成一个点、只保留跨分量的边后，得到的图必为 DAG（否则两个分量仍然互相可达，与分量的极大性矛盾）。

- **做法**：用 Tarjan 求 SCC，把每个分量的金币累加到 `res[sccno[i]]`；跨分量边 `u -> v`（`sccno[u] != sccno[v]`）加入缩点图 `g`。在 DAG 上记忆化求 `f(u) = res[u] + max f(v)`（对所有后继取最大值，没有可用后继时取 0），答案取所有分量 `f` 的最大值。

- **正确性**：任意一条可行路线按分量合并后在缩点图上仍是一条路径，金币数不变；反过来缩点图上的任一条路径也能展开成原图中的一条路线。故缩点图上的最大带权和路径即为答案，而记忆化搜索恰好枚举了所有路径的权值。总时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 5;
int n, m;
ll val[N], dp[N], res[N];
vector<int> G[N], g[N];
int cnt;
int low[N], num[N], dfn;
int sccno[N], st[N], top;
vector<int> scc[N];
void dfs(int u) {
    st[top++] = u;
    low[u] = num[u] = ++dfn;
    for (auto v : G[u]) {
        if (!num[v]) {
            dfs(v);
            low[u] = min(low[u], low[v]);
        } else if (!sccno[v]) {
            low[u] = min(low[u], num[v]);
        }
    }
    if (low[u] == num[u]) {
        cnt++;
        while (1) {
            int v = st[--top];
            sccno[v] = cnt;
            scc[cnt].push_back(v);
            if (u == v)
                break;
        }
    }
}
void tarjan(int n) {
    cnt = top = dfn = 0;
    memset(sccno, 0, sizeof(sccno));
    memset(num, 0, sizeof(num));
    memset(low, 0, sizeof(low));
    for (int i = 1; i <= n; i++) {
        if (!num[i])
            dfs(i);
    }
}
ll f(int u) {
    if (dp[u] > 0)
        return dp[u];
    for (auto v : g[u]) dp[u] = max(dp[u], f(v));
    return dp[u] += res[u];
}
void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> val[i];
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
    }
    tarjan(n);
    for (int i = 1; i <= n; i++) {
        for (auto j : G[i]) {
            if (sccno[i] != sccno[j]) {
                g[sccno[i]].emplace_back(sccno[j]);
            }
        }
    }
    for (int i = 1; i <= n; i++) res[sccno[i]] += val[i];
    ll ans = 0;
    for (int i = 1; i <= cnt; i++) {
        ans = max(ans, f(i));
    }
    cout << ans << '\n';
}
```

:::

### Mail Delivery


**题目大意**：给定一张无向图（$n \le 10^5$，$m \le 2 \times 10^5$），要求从 1 号城市出发，经过每条道路恰好一次并最终回到 1 号城市，输出对应的欧拉回路；不存在则输出 `IMPOSSIBLE`。

**解题思路**：

- **观察**：存在从 1 号出发经过每条边恰好一次并回到 1 号的回路的充要条件是：所有非零度顶点同属一个连通块，且每个顶点的度数为偶数。代码先逐个检查 `graph[i].size()` 是否为偶数。

- **做法**：从 1 号开始 `find_cycle(node)`：反复取出当前节点的一条未用边（同时从两端点的 `set` 中删除），递归走到另一端；当前节点再无未用边时才把它加入 `cycle`（后序）。

- **正确性**：后序意味着当前节点的所有边都走完才记录它，等价于把新走出的环拼接到已有回路的正确位置，故 `cycle` 就是一条每条边恰用一次的闭合步道——由度数全为偶数，走过的子图在每个顶点上的已用度数也都是偶数，这条步道不可能终止在 1 号之外。`cycle.size() == m + 1` 既检查了全部道路都已使用，也兜住了不连通的情形：存在 1 号走不到的边时 `cycle` 会更短。时间复杂度为 $O(m\log n+n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
vector<set<int>> graph;
vector<int> cycle;

void fail() {
    cout << "IMPOSSIBLE\n";
    exit(0);
}

void find_cycle(int node) {
    while (!graph[node].empty()) {
        int next_node = *graph[node].begin();
        graph[node].erase(next_node);
        graph[next_node].erase(node);
        find_cycle(next_node);
    }
    cycle.push_back(node);
}

void solve() {
    int n, m;
    cin >> n >> m;

    graph.resize(n + 1);
    for (int i = 1; i <= m; i++) {
        int a, b;
        cin >> a >> b;
        graph[a].insert(b);
        graph[b].insert(a);
    }

    for (int i = 1; i <= n; i++) {
        if (graph[i].size() % 2 != 0)
            fail();
    }

    find_cycle(1);
    if (cycle.size() != m + 1)
        fail();

    for (auto node : cycle) {
        cout << node << " ";
    }
    cout << "\n";
}
```

:::

### De Bruijn Sequence


**题目大意**：构造一个最短的二进制串，使它的所有长度为 `n` （$n \le 15$）的连续子串互不相同（即包含全部 $2^n$ 种 `n` 位二进制串）。

**解题思路**：

- **观察**：把每个 $n-1$ 位二进制串视为节点：状态 `v` 追加位 `i` 得到 `n` 位串 `u = (v << 1) + i`，并转移到 `u` 的后 $n-1$ 位。每个 `n` 位串恰对应一条有向边，每个节点的入度、出度都是 2，且该图强连通，因此存在欧拉回路；沿回路依次写下各条边的追加位，得到的就是长度 $2^n+n-1$、包含全部 `n` 位子串各一次的序列。

- **做法**：`used[u]` 标记边 `u = (v << 1) + i` 是否已经走过。`dfs(v)` 按 `i = 0, 1` 枚举边，未用过就标记并递归到新状态 `u & ((1 << (n - 1)) - 1)`，回溯时把位 `i` 追加到 `ans`——后序顺序配合末尾补上的 $n-1$ 个 0，正好拼出所求序列。时间复杂度为 $O(2^n)$，空间复杂度为 $O(2^n)$。

:::details[题解(C++)]

```c++
const int MAXN = 1 << 16;
bool used[MAXN];
string ans;
int n;
void dfs(int v) {
    for (int i = 0; i < 2; i++) {
        int u = (v << 1) + i;
        if (!used[u]) {
            used[u] = true;
            dfs(u & ((1 << (n - 1)) - 1));
            ans += char('0' + i);
        }
    }
}

void solve() {
    cin >> n;
    dfs(0);
    ans += string(n - 1, '0');
    cout << ans << '\n';
}
```

:::

### Teleporters Path


**题目大意**：有向图（$n \le 10^5$，$m \le 2 \times 10^5$），求从 1 号出发、到 `n` 号结束、经过**每条边恰好一次**的路径（欧拉路径），输出经过的顶点序列；不存在则输出 `IMPOSSIBLE`。

**解题思路**：

- **观察**：有向欧拉路径从 1 到 `n` 存在的充要条件：`out[1] = in[1] + 1`、`in[n] = out[n] + 1`、其余顶点入度等于出度，且所有边在忽略方向后属于同一连通块。

- **做法**：先执行 `in_degree[1]++`、`out_degree[n]++`，相当于补上一条虚拟边 `n -> 1`，若欧拉路径存在，所有顶点此时都应满足入度等于出度，逐点检验即可。随后从 1 开始 `find_cycle`：反复从 `graph[node]` 末尾取一条未用出边并删除，递归走到终点，回溯时把当前节点加入 `cycle`（后序）；反转 `cycle` 得到从 1 到 `n` 的顶点序列。`cycle.size() == m + 1` 保证全部真实边都已使用（不满足则输出 `IMPOSSIBLE`）。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
vector<vector<int>> graph;
vector<int> cycle;

void fail() {
    cout << "IMPOSSIBLE\n";
    exit(0);
}

void find_cycle(int node) {
    while (!graph[node].empty()) {
        int next_node = graph[node].back();
        graph[node].pop_back();
        find_cycle(next_node);
    }
    cycle.push_back(node);
}

void solve() {
    int n, m;
    cin >> n >> m;

    graph.resize(n + 1);
    vector<int> in_degree(n + 1);
    vector<int> out_degree(n + 1);
    for (int i = 1; i <= m; i++) {
        int a, b;
        cin >> a >> b;
        graph[a].push_back(b);
        out_degree[a]++;
        in_degree[b]++;
    }

    in_degree[1]++;
    out_degree[n]++;
    for (int i = 1; i <= n; i++) {
        if (in_degree[i] != out_degree[i])
            fail();
    }

    find_cycle(1);
    if (cycle.size() != m + 1)
        fail();

    reverse(cycle.begin(), cycle.end());
    for (auto node : cycle) {
        cout << node << " ";
    }
    cout << "\n";
}
```

:::

### Hamiltonian Flights


**题目大意**：`n` 个城市（$n \le 20$）、`m` 条单向航班（同一起终点的多条航班视为不同路线），求从 1 号出发、恰好经过每个城市一次、最后到达 `n` 号的路线数，对 $10^9+7$ 取模。

**解题思路**：`ways[mask][last]` 表示已访问城市集合为 `mask`、当前停在 `last` 的路线数（城市按 0 起编号，`mask` 的第 `i` 位对应城市 `i + 1`），初始 `ways[1][0] = 1`。对每个 `mask` 从小到大、对其中每个 `last` 枚举 `mask` 中的所有城市 `prev` 做转移：
$$
ways[mask][last]=\sum_{prev\in mask}count[prev][last]\cdot ways[mask\oplus 2^{last}][prev]
$$
其中 `count[prev][last]` 为 `prev` 到 `last` 的航班条数，乘进去就正确计入了重边形成的不同路线；每算完一个 `ways[mask][last]` 就对 $10^9+7$ 取模。答案为 `ways[(1 << n) - 1][n - 1]`。时间复杂度为 $O(n^2 2^n)$，空间复杂度为 $O(n2^n)$。

:::details[题解(C++)]

```c++
const int M = 1e9 + 7;

void solve() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> count(n, vector<int>(n));

    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        a--;
        b--;
        count[a][b]++;
    }

    vector<vector<ll>> ways(1 << n, vector<ll>(n));
    ways[1][0] = 1;

    for (int mask = 2; mask < (1 << n); mask++) {
        vector<int> nodes;
        for (int node = 0; node < n; node++) {
            if (mask & (1 << node)) {
                nodes.push_back(node);
            }
        }

        for (auto last : nodes) {
            for (auto prev : nodes) {
                ways[mask][last] +=
                    count[prev][last] * ways[mask ^ (1 << last)][prev];
            }
            ways[mask][last] %= M;
        }
    }

    cout << ways[(1 << n) - 1][n - 1] << "\n";
}
```

:::

### Knight's Tour


**题目大意**：在 $8 \times 8$ 的国际象棋棋盘上，从给定起点出发，寻找一条经过每个格子恰好一次的骑士巡游路径，并输出每个格子是第几步到达的。

**解题思路**：

- **做法**：DFS 回溯，`grid[y][x]` 存该格是第几步到达的（0 表示未访问），行列都从 0 起算。每走一步先枚举所有在棋盘内且尚未访问的落点，用 `degree` 统计每个候选点还能前往的未访问格数，按该值升序排序后依次尝试（Warnsdorff 启发式：优先进入后续出路最少的格子）。

- **正确性**：Warnsdorff 只改变候选的尝试顺序，不改变被搜索的解集合——某个候选走不通时回溯后仍会尝试其余候选，只有走满 64 格才输出并 `exit`；放弃当前分支时会把 `grid[y][x]` 复位为 0。最坏情况需要穷尽全部走法，时间复杂度为指数级，但该启发式让 $8\times8$ 棋盘上的实际搜索规模足够小。

:::details[题解(C++)]

```c++
#define N 8

vector<vector<int>> grid(N, vector<int>(N));

vector<int> dy = {1, 1, -1, -1, 2, 2, -2, -2};
vector<int> dx = {2, -2, 2, -2, 1, -1, 1, -1};

int degree(int y, int x) {
    int count = 0;
    for (int d = 0; d < N; d++) {
        int new_y = y + dy[d];
        int new_x = x + dx[d];
        if (new_y < 0 || new_y >= N || new_x < 0 || new_x >= N)
            continue;
        if (grid[new_y][new_x])
            continue;
        count++;
    }
    return count;
}

void print() {
    for (int y = 0; y < N; y++) {
        for (int x = 0; x < N; x++) {
            cout << grid[y][x] << " ";
        }
        cout << "\n";
    }
}

void search(int y, int x, int c) {
    if (grid[y][x])
        return;
    grid[y][x] = c;

    if (c == N * N) {
        print();
        exit(0);
    }

    vector<array<int, 3>> choices;
    for (int d = 0; d < 8; d++) {
        int new_y = y + dy[d];
        int new_x = x + dx[d];
        if (new_y < 0 || new_y >= N || new_x < 0 || new_x >= N)
            continue;
        if (grid[new_y][new_x])
            continue;
        choices.push_back({degree(new_y, new_x), new_y, new_x});
    }

    sort(choices.begin(), choices.end());
    for (auto [_, new_y, new_x] : choices) {
        search(new_y, new_x, c + 1);
    }

    grid[y][x] = 0;
}

void solve() {
    int x, y;
    cin >> x >> y;

    search(y - 1, x - 1, 1);
}
```

:::

### Download Speed


**题目大意**：`n` 台电脑、`m` 条单向连接（$n \le 500$，$m \le 1000$），每条连接有带宽上限，求从 1 号到 `n` 号最多能传输的带宽（即最大流）。

**解题思路**：

- **观察**：从源到汇的最大总流量可以用增广路求解：残余网络中只要还存在源到汇的路径，就还能继续增加流量。本题源为 1 号、汇为 `n` 号，每条连接建一条容量等于带宽的正向边和一条容量 0 的反向边（反向边用于撤销已经发送的流量）。

- **做法**：容量缩放增广。`bit` 从 $2^{62}$ 起逐次减半；固定 `bit` 时反复调用 `dfs(source, bit)`，只沿残余容量不小于 `bit` 的边搜索，找到路径就沿路增流 `bit`（正向减、反向加），重置 `seen` 后再找，直到当前尺度下不存在可行路径，再缩小 `bit`。

- **正确性**：每次增广都沿残余路径发送流量，容量限制与流量守恒始终成立；当 `bit` 降到 1 且不再有可行路径时，残余网络中已不存在任何正容量的源汇路径，由最大流最小割定理，此时流量就是最大流。时间复杂度为 $O(E^2\log C)$，空间复杂度为 $O(n+E)$（`C` 为容量上界）。

:::details[题解(C++)]

```c++
struct MaxFlow {
    struct Edge {
        int from;
        int to;
        ll w;
    };

    int n, source, sink;
    vector<vector<int>> g;
    vector<Edge> edges;
    vector<bool> seen;
    ll flow = 0;

    MaxFlow(int n, int source, int sink)
        : n(n), source(source), sink(sink), g(n) {}

    int add_edge(int from, int to, ll forward, ll backward = 0) {
        const int id = (int)edges.size();
        g[from].emplace_back(id);
        edges.push_back({from, to, forward});
        g[to].emplace_back(id + 1);
        edges.push_back({to, from, backward});
        return id;
    }

    bool dfs(int node, ll lim) {
        if (node == sink)
            return true;
        if (seen[node])
            return false;
        seen[node] = true;
        for (int i : g[node]) {
            auto& e = edges[i];
            auto& back = edges[i ^ 1];
            if (e.w >= lim) {
                if (dfs(e.to, lim)) {
                    e.w -= lim;
                    back.w += lim;
                    return true;
                }
            }
        }
        return false;
    }

    ll max_flow() {
        for (ll bit = 1ll << 62; bit > 0; bit /= 2) {
            bool found = false;
            do {
                seen.assign(n, false);
                found = dfs(source, bit);
                flow += bit * found;
            } while (found);
        }
        return flow;
    }
};

void solve() {
    int n, m;
    cin >> n >> m;

    MaxFlow flow(n, 0, n - 1);
    for (int i = 0; i < m; ++i) {
        int a, b, w;
        cin >> a >> b >> w;
        a--;
        b--;
        flow.add_edge(a, b, w, 0);
    }

    cout << flow.max_flow() << '\n';
}
```

:::

### Police Chase


**题目大意**：无向图（$n \le 500$，$m \le 1000$），问至少拆掉多少条边能让 1 号与 `n` 号不连通（即边权为 1 的最小割），并输出这些要拆的边。

**解题思路**：

- **观察**：拆掉最少的边使 1 与 `n` 不连通就是容量为 1 的最小割；由最大流最小割定理，最小割的容量等于最大流值。把每条无向路建成两个方向、容量各 1 的边后，最大流值就等于最小割容量，也就是要拆掉的边数。

- **做法**：Edmonds-Karp（每轮 BFS 找一条最短增广路，沿路修改正反向残余容量）求最大流 `k` 并输出。随后从 1 号起沿残余容量大于 0 的边 DFS，`visited` 集合就是从源出发仍可达的点集；枚举原始无向边，两端分属两侧的即为要拆的边。

- **正确性**：最大流结束时，源点侧恰好就是从源沿正残余容量可达的节点集合，而跨越两侧的每条原边必然已经流满（容量为 1，否则还能继续增广），把它们删掉就使 1 与 `n` 不连通，且数量恰为最大流值，等于最小割容量，故这是最优方案。时间复杂度为 $O(VE^2)$（$V$、$E$ 为点数与边数），空间复杂度为 $O(n^2+m)$。

:::details[题解(C++)]

```c++
int n, m;
long long capacity[505][505];
vector<int> adj[505];
int parent[505];

long long bfs(int s, int t) {
    fill(parent + 1, parent + n + 1, -1);
    parent[s] = -2;
    queue<pair<int, long long>> q;
    q.push({s, INFLL});

    while (!q.empty()) {
        int u = q.front().first;
        long long flow = q.front().second;
        q.pop();

        for (int v : adj[u]) {
            if (parent[v] == -1 && capacity[u][v] > 0) {
                parent[v] = u;
                long long new_flow = min(flow, capacity[u][v]);
                if (v == t)
                    return new_flow;
                q.push({v, new_flow});
            }
        }
    }
    return 0;
}

long long max_flow(int s, int t) {
    long long flow = 0;
    long long new_flow;
    while (new_flow = bfs(s, t)) {
        flow += new_flow;
        int cur = t;
        while (cur != s) {
            int prev = parent[cur];
            capacity[prev][cur] -= new_flow;
            capacity[cur][prev] += new_flow;
            cur = prev;
        }
    }
    return flow;
}

bool visited[505];
void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v] && capacity[u][v] > 0) {
            dfs(v);
        }
    }
}

void solve() {
    cin >> n >> m;
    vector<pair<int, int>> original_edges;
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
        capacity[u][v] = 1;
        capacity[v][u] = 1;
        original_edges.push_back({u, v});
    }

    long long k = max_flow(1, n);
    cout << k << '\n';

    dfs(1);
    for (auto& edge : original_edges) {
        int u = edge.first;
        int v = edge.second;

        if ((visited[u] && !visited[v]) || (!visited[u] && visited[v])) {
            cout << u << " " << v << "\n";
        }
    }
}
```

:::

### School Dance


**题目大意**：`n` 个男生、`m` 个女生（$n, m \le 500$）、`e` 对“愿意搭档”的组合，同一对只能配对一次，求最多能配成多少对，并输出配对方案（二分图最大匹配）。

**解题思路**：

- **观察**：从某个未匹配男生出发，交替走未匹配边与匹配边、终于未匹配女生的路径就是增广路；把增广路上所有边的匹配状态翻转，匹配数就加 1，而不存在增广路时匹配已经最大。

- **做法**：`links[i]` 记录与女生 `i` 匹配的男生。依次对每个男生 `x` 做 DFS：枚举他愿意搭档且本轮尚未尝试的女生 `i`，若她还没被匹配，或她的原配 `links[i]` 能递归改配到别处，就让 `links[i] = x`、增广成功。每轮开始前清空 `vis`，同一轮内每位女生只尝试一次。成功增广的次数就是最大匹配数，最后按 `links` 输出配对。

- **正确性**：每轮成功的 DFS 恰对应一条增广路并把匹配数加 1；失败说明以 `x` 为起点已不存在增广路，按男生处理顺序归纳可知当前匹配已是对已处理部分的最大匹配，故全部处理完后匹配最大。时间复杂度为 $O(n^2m)$，空间复杂度为 $O(nm)$。

:::details[题解(C++)]

```c++
const int N = 1e3 + 5;
int a[N][N];
int n, m, e;
bool vis[N];
int links[N];
int dfs(int x) {
    for (int i = 1; i <= m; i++) {
        if (!a[x][i] || vis[i])
            continue;
        vis[i] = true;
        if (links[i] == 0 || dfs(links[i])) {
            links[i] = x;
            return 1;
        }
    }
    return 0;
}
void solve() {
    memset(a, 0, sizeof(a));
    memset(links, 0, sizeof(links));
    cin >> n >> m >> e;
    for (int i = 1; i <= e; i++) {
        int x, y;
        cin >> x >> y;
        a[x][y] = 1;
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        memset(vis, false, sizeof(vis));
        ans += dfs(i);
    }
    cout << ans << '\n';
    for (int i = 1; i <= max(n, m); i++)
        if (links[i])
            cout << links[i] << ' ' << i << '\n';
}
```

:::

### Distinct Routes


**题目大意**：有向图（$n \le 500$，$m \le 1000$），每条边（传送器）最多使用一次。每天从 1 号出发沿有向边走一条路到 `n` 号，问最多能玩多少天，并输出每天的路线（即求边互不相交的路径的最大数量）。

**解题思路**：

- **观察**：每条边容量为 1，整数流下每个单位的流对应一条 1 到 `n` 的路径，不同单位的路径不共边，因此边不相交路径的最大数量等于最大流值。

- **做法**：用 Dinic（BFS 建分层图，DFS 只沿层级递增的边发送阻塞流，反复直到没有增广路）求最大流 `k`。随后做路径分解：`orig` 区分原始边与反向边，原始边 `e.cap == 0` 表示它正在承载 1 单位流；每轮从 1 开始 BFS，只走这类边找一条到 `n` 的路径，沿 `parent` 还原并输出该路线，再把这条路径上的正向容量恢复为 1、反向容量清 0（相当于从总流中删去这条路径），重复 `k` 轮。

- **正确性**：残余网络中的流按流量守恒可分解为若干条 1 到 `n` 的简单路径，`orig && cap == 0` 的边恰好构成这些路径；每轮剥离一条并复原其容量后仍满足流量守恒，故 `k` 轮后恰好输出 `k` 条边不相交路径。总时间复杂度为 $O(E\sqrt E+kE)$（Dinic 在单位容量网络上为 $O(E\sqrt E)$，路径分解为 $O(kE)$），空间复杂度为 $O(n+E)$。

:::details[题解(C++)]

```c++
const int N = 1e3 + 5;

struct Edge {
    int to, cap, rev;
    bool orig;
};
vector<Edge> g[N];
int level[N], iter[N];

void addEdge(int a, int b, int c) {
    g[a].push_back({b, c, (int)g[b].size(), true});
    g[b].push_back({a, 0, (int)g[a].size() - 1, false});
}

void bfs(int s) {
    memset(level, -1, sizeof level);
    queue<int> q;
    level[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (auto& e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
    }
}

int dfs(int u, int t, int f) {
    if (u == t)
        return f;
    for (int& i = iter[u]; i < (int)g[u].size(); i++) {
        Edge& e = g[u][i];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {
            int d = dfs(e.to, t, min(f, e.cap));
            if (d > 0) {
                e.cap -= d;
                g[e.to][e.rev].cap += d;
                return d;
            }
        }
    }
    return 0;
}

int maxflow(int s, int t) {
    int flow = 0;
    while (true) {
        bfs(s);
        if (level[t] == -1)
            break;
        memset(iter, 0, sizeof iter);
        int f;
        while ((f = dfs(s, t, INT_MAX)) > 0) flow += f;
    }
    return flow;
}

void solve() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int a, b;
        cin >> a >> b;
        addEdge(a, b, 1);
    }

    int k = maxflow(1, n);
    cout << k << '\n';

    vector<int> parent(n + 1, -1);
    for (int cnt = 0; cnt < k; cnt++) {
        fill(parent.begin(), parent.end(), -1);
        queue<int> q;
        parent[1] = 1;
        q.push(1);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (auto& e : g[u])
                if (e.orig && e.cap == 0 && parent[e.to] == -1) {
                    parent[e.to] = u;
                    if (e.to == n)
                        break;
                    q.push(e.to);
                }
        }

        vector<int> route = {1};
        for (int v = n; v != 1; v = parent[v]) route.push_back(v);
        reverse(route.begin() + 1, route.end());

        cout << route.size() << '\n';
        for (int i = 0; i < (int)route.size(); i++)
            cout << route[i] << (i + 1 == (int)route.size() ? '\n' : ' ');

        for (int i = 0; i + 1 < (int)route.size(); i++) {
            int a = route[i], b = route[i + 1];
            for (auto& e : g[a])
                if (e.orig && e.cap == 0 && e.to == b) {
                    e.cap = 1;
                    g[b][e.rev].cap = 0;
                    break;
                }
        }
    }
}
```

:::

## Advanced Graph Problems

### Nearest Shops


**题目大意**：$n$ 个城市、$m$ 条双向道路，其中 $k$ 个城市有动漫商店。对每个城市，求它到**另一个**有商店的城市的最短距离（住在有商店的城市当然熟悉本地商店，所以它要算的是别的城市的商店）。无解输出 $-1$。

**解题思路**：注意住在本地的商店不算，所以有商店的城市答案不是 $0$，而是到**另一个**商店的距离（只有一家店时为 $-1$）；没有商店的城市则就是到最近商店的距离。做法是「每个点保留两个**不同起点**的最近距离」的多源 BFS：把 $k$ 个商店同时入队、距离 $0$、各自带自己的标号，出队时若该点还没记录过就记下当前标号的距离，若已有相同标号则跳过，否则记成第二个标号的距离；一个点最多记录两个不同标号。无商店的城市取第一个距离，有商店的城市取第二个距离（没有则为 $-1$）。正确性：若某个源 $s$ 的波在点 $u$ 处被挡住，说明 $u$ 已有两个比 $s$ 更近的不同源，那么 $u$ 的邻居 $v$ 也有两个比 $s$ 更近的源，$s$ 本来就不该是 $v$ 的次近源。每个点最多入队两次，时间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int MAXN = 100005;
const int MAXM = 200005;

int head[MAXN], nxt[2 * MAXM], to[2 * MAXM], ecnt = 1;   // 0 为链表结束哨兵
int d1[MAXN], l1[MAXN], d2[MAXN], l2[MAXN];
bool hasShop[MAXN];

void solve()
{
    int n, m, k;
    cin >> n >> m >> k;
    for (int i = 0; i < k; i++)
    {
        int s;
        cin >> s;
        hasShop[s] = true;
    }
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        to[ecnt] = b; nxt[ecnt] = head[a]; head[a] = ecnt++;
        to[ecnt] = a; nxt[ecnt] = head[b]; head[b] = ecnt++;
    }
    for (int i = 1; i <= n; i++) d1[i] = l1[i] = d2[i] = l2[i] = -1;

    vector<array<int, 3>> q;      // (节点, 距离, 源点标号)
    q.reserve(4 * m + k + 10);
    for (int s = 1; s <= n; s++)
        if (hasShop[s]) q.push_back({s, 0, s});

    for (size_t qi = 0; qi < q.size(); qi++)
    {
        int v = q[qi][0], d = q[qi][1], L = q[qi][2];
        if (d1[v] == -1) { d1[v] = d; l1[v] = L; }
        else if (l1[v] == L) continue;      // 这个源已经到过 v
        else if (d2[v] == -1) { d2[v] = d; l2[v] = L; }
        else continue;                      // 已经有两个不同源
        for (int e = head[v]; e != 0; e = nxt[e])
            q.push_back({to[e], d + 1, L});
    }

    for (int v = 1; v <= n; v++)
        cout << (hasShop[v] ? d2[v] : d1[v]) << " \n"[v == n];
}
```

:::

### Prüfer Code


**题目大意**：第一行给出 $n$，随后给出 $n-2$ 个整数，是一棵 $n$ 个点的标号树的 Prüfer 序列。重建这棵树并输出它的 $n-1$ 条边，每行一条，两个端点用空格分隔。

**解题思路**：

- **观察**：Prüfer 序列与标号树一一对应，且每个点在序列中出现的次数等于它在树中的度数减一——所以没在序列里出现过的点恰好是叶子。代码用 `degree[i]` 统计点 `i` 在 `code` 中的出现次数，把所有 `degree[i] == 0` 的点放进小根堆 `leaves`。

- **做法**：按 `code[1..n-2]` 依次解码：每次取出编号最小的点 `leaves.top()`，把它与 `code[i]` 连边输出；随后把 `degree[code[i]]` 减 1，减到 0 说明 `code[i]` 已经变成新叶子，压入堆。

- **边界**：处理完序列后堆里只剩两个点，最后一条边输出 `leaves.top()` 与 `n`，依据是 `n` 一定还留在堆里：只要还剩不少于 3 个点，剩下的树就至少有两片叶子，而 `n` 是最大标号，被取走的只会是编号更小的那片叶子。$n=2$ 时序列为空，循环不执行，直接输出 `1 2`。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
const int N = 200001;
int code[N];
int degree[N];
void solve()
{
    int n;
    cin >> n;

    for (int i = 1; i <= n - 2; ++i)
    {
        cin >> code[i];
        degree[code[i]]++;
    }

    priority_queue<int, vector<int>, greater<int>> leaves;
    for (int i = 1; i <= n; ++i)
    {
        if (degree[i] == 0)
        {
            leaves.push(i);
        }
    }

    for (int i = 1; i <= n - 2; ++i)
    {
        cout << code[i] << ' ' << leaves.top() << '\n';
        leaves.pop();
        degree[code[i]]--;
        if (degree[code[i]] == 0)
        {
            leaves.push(code[i]);
        }
    }

    cout << leaves.top() << ' ' << n << '\n';
}
```

:::

### Tree Traversals


**题目大意**：第一行给出 $n$，接下来两行分别是二叉树的先序遍历与中序遍历（都是 $1..n$ 的排列，值互不相同）。输出它的后序遍历，依次输出每个点。

**解题思路**：先序的第一个元素是根，中序里根左侧属于左子树、右侧属于右子树。代码用 `pos[v]` 记下值 `v` 在中序中的下标：对当前区间（先序下标 $[pl,pr]$、中序下标 $[il,ir]$），根是 `root = pre[pl]`、它的中序位置是 `m = pos[root]`，于是左子树大小 `leftLen = m - il`，左子树对应先序 $[pl+1, pl+leftLen]$ 与中序 $[il, m-1]$，右子树对应先序 $[pl+leftLen+1, pr]$ 与中序 $[m+1, ir]$。递归处理完左右子树后输出 `root`，恰好是后序（左、右、根）。区间为空（`pl > pr`）时直接返回，作为递归出口；每个点恰好被输出一次。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
int n;
vector<int> pre, ino, pos;
void build(int pl, int pr, int il, int ir)
{
    if (pl > pr) return;
    int root = pre[pl];
    int m = pos[root];
    int leftLen = m - il;
    build(pl + 1, pl + leftLen, il, m - 1);
    build(pl + leftLen + 1, pr, m + 1, ir);
    cout << root << ' ';
}
void solve()
{
    cin >> n;
    pre.resize(n);
    ino.resize(n);
    pos.resize(n + 1);
    for (auto &v : pre) cin >> v;
    for (int i = 0; i < n; i++)
    {
        cin >> ino[i];
        pos[ino[i]] = i;
    }
    build(0, n - 1, 0, n - 1);
    cout << '\n';
}
```

:::

### Course Schedule II


**题目大意**：输入 `n`、`m` 与 `m` 条依赖，每条 `a b` 表示课程 `a` 必须排在课程 `b` 之前（即一条边 $a\to b$）。输出一个完成顺序，要求在满足依赖的前提下，课程 1 的位置尽量靠前，在此基础上课程 2 的位置尽量靠前，依此类推；有环输出 IMPOSSIBLE。

**解题思路**：

- **观察**：目标是最小化位置向量 $(pos(1), pos(2), \dots, pos(n))$ 的字典序，它并不等于最小拓扑序字典序：正向小根堆每步取编号最小的可用课程，会为了取到小编号而在无关处先把小编号用掉。例如只有一条依赖「4 必须早于 1」（边 $4\to1$）时，正向小根堆给出 `2,3,4,1`，而 `4,1,2,3` 能让课程 1 更早完成。

- **做法**：等价地从后往前放：每一步在当前所有没有出边的课程里取**编号最大**的放到末尾。代码在**反向图**（把输入 $a\ b$ 建成 $b\to a$）上用大根堆 `pq` 做拓扑排序，得到序列 `order` 后倒序输出；每步取的是反向图中编号最大的入度 0 点，正好是原图当前编号最大的无出边点。出队点数不足 `n` 说明有环，输出 IMPOSSIBLE。

- **正确性**：反向图的拓扑序倒置仍是原图的拓扑序，所以只需论证「每步取编号最大的无出边点」最优。设当前图编号最大的无出边点为 $z$，若某个最优序列以 $e\ne z$ 结尾，则 $e$ 也是无出边点、故 $e<z$。把 $z$ 挪到末尾仍是合法序列，且只有 $z$ 与原本排在 $z$ 之后的点改变位置：若 $z$ 之后有比 $z$ 小的点，位置向量的第一个变化坐标变小，与最优性矛盾；若 $z$ 之后的点都比 $z$ 大，则末位 $e>z$，与 $e<z$ 矛盾。故存在以 $z$ 结尾的最优序列，删去 $z$ 后归纳即可。时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<int>> rg(n);
    vector<int> indeg(n, 0);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        rg[b].push_back(a);
        indeg[a]++;
    }
    priority_queue<int> pq;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) pq.push(i);
    vector<int> order;
    while (!pq.empty())
    {
        int u = pq.top();
        pq.pop();
        order.push_back(u);
        for (int v : rg[u])
            if (--indeg[v] == 0) pq.push(v);
    }
    if (order.size() != n)
    {
        cout << "IMPOSSIBLE\n";
        return;
    }
    for (int i = n - 1; i >= 0; i--) cout << order[i] + 1 << ' ';
    cout << '\n';
}
```

:::

### Acyclic Graph Edges


**题目大意**：给定 $n$ 个点、$m$ 条边的无向图，为每条边选定一个方向，使得到的有向图无环。输出 `m` 行，第 $i$ 行是第 $i$ 条边定向后的起点与终点。

**解题思路**：把每条边都从编号小的端点指向编号大的端点。这样任意一条有向路径上点的编号都严格递增，不可能回到已经过的点，因此不可能成环。每条边的方向只由它两端编号的大小决定，与其它边、读入顺序、重边都无关，按输入顺序输出 `min(a,b)` 与 `max(a,b)` 即可。时间复杂度为 $O(m)$，空间复杂度为 $O(1)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;

    for (int i = 1; i <= m; ++i)
    {
        int a, b;
        cin >> a >> b;
        cout << min(a, b) << ' ' << max(a, b) << '\n';
    }
}
```

:::

### Strongly Connected Edges


**题目大意**：给定 $n$ 个点、$m$ 条边的无向图，为每条边选定一个方向，使得到的有向图强连通；无解输出 IMPOSSIBLE。有解时输出 `m` 行，第 $i$ 行是第 $i$ 条边定向后的起点与终点。

**解题思路**：

- **判据**：有解当且仅当图连通且没有桥。桥无论朝哪个方向定，两侧之间都只剩单向通路，不可能双向可达，故有桥必无解；图不连通时更不可能强连通。

- **做法**：先用 Tarjan 求桥并数连通块（有桥或连通块多于 1 就输出 IMPOSSIBLE）；再做一遍 DFS 定向，用 `from`、`to` 记录每条边：未访问过的邻居对应树边，定成父→子；已访问的邻居只可能是祖先（该边第一次被检查时另一端已经访问，说明祖先那层递归还在栈上、还没轮到检查这条边），定成当前点→该祖先。

- **正确性**：树边父→子，故根可以沿树边走到每个点。反过来看任一点 $c$ 与其父亲 $p$：树边 $(p,c)$ 不是桥，所以割「$c$ 的子树 / 其余点」上必有非树边，而跨出子树的那一端只能是 $c$ 的祖先，按定向规则方向是从子树内指向祖先，于是 $c$ 的子树中存在一点能一步跳到 $p$ 的某个真祖先；先沿树边走到这一点再跳上去，重复即得 $c$ 能到达根。根与每个点双向可达，图强连通。

- **边界**：求桥时只跳过 `id == pe` 这一条具体的父边，平行重边不会被误当成父边而漏判；$n=1$ 不需要任何边就已经强连通。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> g(n);
    vector<pair<int, int>> edgeList(m);
    for (int i = 0; i < m; i++)
    {
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
    function<void(int, int)> dfs = [&](int v, int pe)
    {
        tin[v] = low[v] = timer++;
        for (auto [to, id] : g[v])
        {
            if (id == pe) continue;
            if (tin[to] != -1)
                low[v] = min(low[v], tin[to]);
            else
            {
                dfs(to, id);
                low[v] = min(low[v], low[to]);
                if (low[to] > tin[v]) isBridge[id] = true;
            }
        }
    };
    for (int i = 0; i < n; i++)
        if (tin[i] == -1) dfs(i, -1);
    for (int i = 0; i < m; i++)
        if (isBridge[i])
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    {
        int compCnt = 0;
        vector<int> seen(n, 0);
        function<void(int)> cc = [&](int v)
        {
            seen[v] = 1;
            for (auto [to, id] : g[v])
                if (!seen[to]) cc(to);
        };
        for (int i = 0; i < n; i++)
            if (!seen[i])
            {
                cc(i);
                compCnt++;
            }
        if (compCnt > 1)
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    }

    vector<int> from(m, -1), to(m, -1);
    vector<int> vis(n, 0);
    function<void(int)> orient = [&](int v)
    {
        vis[v] = 1;
        for (auto [nb, id] : g[v])
        {
            if (from[id] != -1 || to[id] != -1) continue;
            if (!vis[nb])
            {
                from[id] = v;
                to[id] = nb;
                orient(nb);
            }
            else
            {
                from[id] = v;
                to[id] = nb;
            }
        }
    };
    for (int i = 0; i < n; i++)
        if (!vis[i]) orient(i);
    for (int i = 0; i < m; i++) cout << from[i] + 1 << ' ' << to[i] + 1 << '\n';
}
```

:::

### Even Outdegree Edges


**题目大意**：给定 $n$ 个点、$m$ 条边的无向图，为每条边选定一个方向，使每个点的出度都是偶数；无解输出 IMPOSSIBLE。有解时输出 `m` 行，第 $i$ 行是第 $i$ 条边定向后的起点与终点。

**解题思路**：

- **做法**：初始定向规则是：树边父→子；其余边（当前点检查到它时另一端已访问，必为祖先）定成祖先→当前点。随后按后序（孩子先于父亲）逐个修正：若点 `v` 的 `outdeg[v]` 是奇数，就把它与父亲的那条树边 `pe[v]` 翻转成 `v`→父亲——`v` 的出度加 1 变成偶数，父亲的出度减 1（代码先 `swap(from[id], to[id])`，再 `outdeg[from[id]]++`、`outdeg[to[id]]--`）。

- **正确性**：按后序处理，轮到 `v` 时它的所有孩子都已处理完，而之后的翻转只会改变「被处理点与它父亲」的出度，不会波及 `v`，故每个非根点被处理后就永久是偶数。又所有点的出度之和等于边数，所以根节点的出度奇偶等于它所在连通块边数的奇偶；若某个根仍是奇数，说明该块边数为奇数，而此时全偶要求出度总和为偶数，确实无解，输出 IMPOSSIBLE。

- **边界**：各连通块互不影响，代码对每个满足 `parent[i] == -1` 的点调用 `fix`；孤立点出度为 0，天然合法。最后统一复查所有 `outdeg` 都是偶数才输出方案。时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> g(n);
    vector<pair<int, int>> edgeList(m);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        edgeList[i] = {a, b};
        g[a].push_back({b, i});
        g[b].push_back({a, i});
    }
    vector<int> from(m, -1), to(m, -1);
    vector<int> parent(n, -1), pe(n, -1);
    vector<int> vis(n, 0);
    function<void(int)> orient = [&](int v)
    {
        vis[v] = 1;
        for (auto [nb, id] : g[v])
        {
            if (from[id] != -1 || to[id] != -1) continue;
            if (!vis[nb])
            {
                from[id] = v;
                to[id] = nb;
                parent[nb] = v;
                pe[nb] = id;
                orient(nb);
            }
            else
            {
                from[id] = nb;
                to[id] = v;
            }
        }
    };
    for (int i = 0; i < n; i++)
        if (!vis[i]) orient(i);

    vector<int> outdeg(n, 0);
    for (int i = 0; i < m; i++) outdeg[from[i]]++;
    function<void(int)> fix = [&](int v)
    {
        for (auto [nb, id] : g[v])
            if (parent[nb] == v) fix(nb);
        if (parent[v] != -1 && (outdeg[v] & 1))
        {
            int id = pe[v];
            swap(from[id], to[id]);
            outdeg[from[id]]++;
            outdeg[to[id]]--;
        }
    };
    for (int i = 0; i < n; i++)
        if (parent[i] == -1) fix(i);

    for (int i = 0; i < n; i++)
        if (outdeg[i] & 1)
        {
            cout << "IMPOSSIBLE\n";
            return;
        }
    for (int i = 0; i < m; i++) cout << from[i] + 1 << ' ' << to[i] + 1 << '\n';
}
```

:::

### Graph Girth


**题目大意**：无向图（$n \le 2500$，$m \le 5000$），求最短环的长度（围长）；图中无环输出 -1。

**解题思路**：

- **观察**：任何环都含有顶点，于是只需对每个起点 `i` 求出经过 `i` 的最短环，再对所有 `i` 取最小值即得围长。

- **做法**：固定 `i` 后把 `i` 的所有邻居作为多源 BFS 的源（`dist` 记为 1），并用 `tree` 记下每个点是沿 `i` 的哪一条邻边展开的（称为它的分支），扩展时分支号向下继承。扫描点 `s` 的每条边 $(s, nxt)$：若 `nxt` 已访问、分支号与 `s` 不同、且 `nxt != i`，则 `dist[s] + dist[nxt] + 1` 是一条经过 `i` 的环长（$i$ 沿两条分支分别走到 `s`、`nxt`，再加回边 $(s,nxt)$），取最小值。

- **正确性**：同一分支内两点的 BFS 树路径共享同一前缀，而不同分支的两条树上路径互不相交（一个点在 BFS 森林中只有一个源），所以上述闭走法是一条简单环，算出的每个值都是真实环长。另一方面，对任何经过 `i` 的环 $i, u_1, \dots, u_k, i$，沿它从 $u_1$ 走到 $u_k$ 时分支号必然发生变化；在变化处的那条边 $(u_t, u_{t+1})$ 上，两个端点都既能沿一侧走、也能沿另一侧绕到，代入即得 `dist` 数组在这两点上的值之和加 $1$ 不超过这个环的长度，故算法给出的正是经过 `i` 的最短环。

- **边界**：`nxt != i` 排除走回起点的情况（起点 `i` 自身没有分支号）；`ans` 初值取 $10^9$，若始终没被更新说明无环，输出 -1。时间复杂度为 $O(n(n+m))$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int BIG = 1e9;
const int N = 2501;
vector<int> g[N];

int dist[N], tree[N];
void solve()
{
    int n, m;
    cin >> n >> m;

    for (int i = 1; i <= m; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    int ans = BIG;
    for (int i = 1; i <= n; i++)
    {
        fill(dist, dist + N, -1);
        dist[i] = 0;
        vector<int> q;
        for (int j = 0; j < g[i].size(); ++j)
        {
            q.push_back(g[i][j]);
            tree[g[i][j]] = j;
            dist[g[i][j]] = 1;
        }
        for (int qi = 0; qi < q.size(); qi++)
        {
            int s = q[qi];
            for (int nxt : g[s])
            {
                if (dist[nxt] == -1)
                {
                    dist[nxt] = dist[s] + 1;
                    tree[nxt] = tree[s];
                    q.push_back(nxt);
                }
                else if (tree[nxt] != tree[s] && nxt != i)
                {
                    ans = min(ans, dist[nxt] + dist[s] + 1);
                }
            }
        }
    }
    if (ans == BIG) ans = -1;
    cout << ans << '\n';
}
```

:::

### Fixed Length Walk Queries


**题目大意**：无向图（$n \le 2500$，$m \le 5000$），`q` 次询问（$q \le 10^5$）：每次给出 `a`、`b`、`k`，问能否从 `a` 出发用恰好 `k` 步走到 `b`（点和边都可以重复经过），输出 YES / NO。

**解题思路**：

- **观察**：把状态取成「点 + 步数奇偶」两层，沿一条边转移就切换一层；于是对固定起点做**奇偶分层 BFS**，`dist0[v]` 与 `dist1[v]` 分别是到 `v` 的偶数长、奇数长最短 walk 长度（不可达时保持 -1）。二分图块内每个点只有一种奇偶可达、含奇环的块内两种奇偶都可达，分层 BFS 会把这两种情况一并处理。

- **做法**：询问按起点分组（`qs[a]`），只对出现在询问里的起点做一次分层 BFS（队列里存 (点, 层)）。回答询问 `(b, k)` 时取与 `k` 同奇偶的那张表：`need = (k & 1) ? dist1[b] : dist0[b]`，若 `need != -1` 且 `k >= need` 输出 YES，否则输出 NO。

- **正确性**：若 `need` 存在且 `k >= need`，先沿最短 walk 走 `need` 步到 `b`，再把多出的 $k-need$ 步（偶数）沿一条与 `b` 相邻的边来回走补足，即得恰好 `k` 步的走法；反之，任何与 `k` 同奇偶的合法 walk 都不短于同奇偶的最短长度，而 `need == -1` 说明该奇偶下根本不可达。

- **边界**：`k` 用 64 位读入，超过 $10^9$ 的部分被截断为 $10^9$（`min(k, 1000000000LL)`）；最短长度不超过 $n$、判定只看 `k >= need`，故截断不改变答案。总时间复杂度为 $O(n(n+m)+q)$，空间复杂度为 $O(n+m+q)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m, q;
    cin >> n >> m >> q;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    vector<vector<tuple<int, int, int>>> qs(n);
    for (int i = 0; i < q; i++)
    {
        int a, b;
        ll k;
        cin >> a >> b >> k;
        a--, b--;
        qs[a].push_back({b, (int)min(k, 1000000000LL), i});
    }
    vector<string> ans(q);
    vector<int> dist0(n), dist1(n);
    for (int s = 0; s < n; s++)
    {
        if (qs[s].empty()) continue;
        fill(dist0.begin(), dist0.end(), -1);
        fill(dist1.begin(), dist1.end(), -1);

        queue<pair<int, int>> qu;
        dist0[s] = 0;
        qu.push({s, 0});
        while (!qu.empty())
        {
            auto [u, p] = qu.front();
            qu.pop();
            int d = (p == 0 ? dist0[u] : dist1[u]);
            for (int v : g[u])
            {
                if (p == 0)
                {
                    if (dist1[v] == -1)
                    {
                        dist1[v] = d + 1;
                        qu.push({v, 1});
                    }
                }
                else
                {
                    if (dist0[v] == -1)
                    {
                        dist0[v] = d + 1;
                        qu.push({v, 0});
                    }
                }
            }
        }
        for (auto [b, k, id] : qs[s])
        {
            int need = (k & 1) ? dist1[b] : dist0[b];
            if (need != -1 && k >= need)
                ans[id] = "YES";
            else
                ans[id] = "NO";
        }
    }
    for (auto &s : ans) cout << s << '\n';
}
```

:::

### Transfer Speeds Sum


**题目大意**：一棵带权树（$n \le 2 \times 10^5$），输入 $n-1$ 条边 $(a,b,w)$。两点之间的传输速度等于它们路径上边权的最小值，求所有点对传输速度之和。

**解题思路**：

- **观察**：把边按权值**从大到小**处理。处理边 $(a,b,w)$ 时，已经处理的边权都不小于 $w$，并查集里的 $A=\text{find}(a)$ 与 $B=\text{find}(b)$ 内部由这些边连通；并且 $A$、$B$ 分别落在「删去 $(a,b)$ 后树的两侧」——若 $A$ 中有点在另一侧，那条树路径必然穿过 $(a,b)$，$b$ 也会被并进 $A$，矛盾。于是任意 $u \in A$、$v \in B$ 的路径必经过 $(a,b)$，而路径在 $A$、$B$ 内部的边权都不小于 $w$，故这条路径的最小边权恰为 $w$。

- **做法**：对每条边把 $w \times |A| \times |B|$ 累加进答案，再合并两块。每个点对恰好在「它被某条边首次连通」的时刻被计入一次，所以累加值就是所有点对传输速度之和。总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n;
    cin >> n;
    vector<tuple<ll, int, int>> edges;
    for (int i = 0; i < n - 1; i++)
    {
        int a, b;
        ll w;
        cin >> a >> b >> w;
        a--, b--;
        edges.push_back({w, a, b});
    }
    sort(edges.rbegin(), edges.rend());
    vector<int> fa(n), sz(n, 1);
    iota(fa.begin(), fa.end(), 0);
    function<int(int)> find = [&](int x)
    {
        while (fa[x] != x) x = fa[x] = fa[fa[x]];
        return x;
    };
    ll ans = 0;
    for (auto [w, a, b] : edges)
    {
        a = find(a);
        b = find(b);
        if (a == b) continue;
        ans += w * (ll)sz[a] * sz[b];
        if (sz[a] < sz[b]) swap(a, b);
        fa[b] = a;
        sz[a] += sz[b];
    }
    cout << ans << '\n';
}
```

:::

### MST Edge Check


**题目大意**：带权无向图（$n, m \le 2 \times 10^5$），对每条边判断它能否出现在某棵最小生成树中，按输入顺序输出 YES / NO。

**解题思路**：

- **判据**：边 $(a,b,w)$ 能出现在某棵最小生成树中，当且仅当在只使用权**严格小于** $w$ 的边时 $a$、$b$ 仍不连通。充分性：Kruskal 按权递增扫描到它时 $a$、$b$ 还不在同一块，于是可以选它，而 Kruskal 每次选边总是安全的。必要性：若 $a$、$b$ 已被更轻的边连通，则加入 $(a,b,w)$ 会与那条更轻路径成环，而 $(a,b,w)$ 是这个环上唯一的最重边，由回路性质它不可能属于任何最小生成树。

- **做法**：把边按权排序，同一组等权边**先统一判断、再统一合并**：判断时若 `find(a) != find(b)` 就置 `ans[id] = true`；若先合并同权边，判断会被同权边自己影响而误判成 NO。时间复杂度为 $O(m\log m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<tuple<ll, int, int, int>> edges;
    for (int i = 0; i < m; i++)
    {
        int a, b;
        ll w;
        cin >> a >> b >> w;
        a--, b--;
        edges.push_back({w, a, b, i});
    }
    sort(edges.begin(), edges.end());
    vector<int> fa(n);
    iota(fa.begin(), fa.end(), 0);
    function<int(int)> find = [&](int x)
    {
        while (fa[x] != x) x = fa[x] = fa[fa[x]];
        return x;
    };
    vector<bool> ans(m, false);
    int i = 0;
    while (i < m)
    {
        int j = i;
        while (j < m && get<0>(edges[j]) == get<0>(edges[i])) j++;

        for (int t = i; t < j; t++)
        {
            auto [w, a, b, id] = edges[t];
            if (find(a) != find(b)) ans[id] = true;
        }

        for (int t = i; t < j; t++)
        {
            auto [w, a, b, id] = edges[t];
            a = find(a);
            b = find(b);
            if (a != b) fa[b] = a;
        }
        i = j;
    }
    for (int i2 = 0; i2 < m; i2++) cout << (ans[i2] ? "YES" : "NO") << '\n';
}
```

:::

### MST Edge Set Check


**题目大意**：给定 $n$ 个点、$m$ 条带权边的无向连通图，以及 $q$ 个边集（所有集合的边数总和不超过 $m$）。对每个集合判断：这些边能否**同时**出现在某一棵最小生成树里。输出 `YES` / `NO`。

**解题思路**：

- **观察**：Kruskal 中，把所有**小于**某个权值 $w$ 的边（注意是全部图边，不只是查询里的边）先合并，得到的并查集状态 $D_w$ 与选哪棵 MST 无关。而任意一棵 MST 在权值层 $w$ 上做的事情，就是在商图 $G/D_w$ 的每个连通分量里取一棵生成森林。

- **判据**：于是边集 $F$ 能装进某棵 MST，等价于对每个权值 $w$，$F$ 中权值为 $w$ 的边在 $G/D_w$ 里**不构成环**。因为森林总能扩充成生成森林（拟阵性质）。$F$ 自身的环会被自动抓到：把环上更轻的边缩掉后，它就变成最重那层里的一个环。本题还有一个细节：查询是「边集」，同一条边在一个集合里可能出现多次，要先去重。

- **做法**：把图边按权值排序，查询边也按（权值, 查询编号）排序。按权值递增扫描，用一个**可回滚并查集**（按大小合并、不路径压缩）维护 $D_w$；处理某一权值层的查询时，对每个查询单独存档、把该查询这一层的边合并进去，一旦发现两端已在同一分量就标记该查询为 `NO`，然后回滚。之后再把这一层的图边真正合并进并查集。总边数 $O(m)$，时间复杂度为 $O((n+m)\log m)$。

:::details[题解(C++)]

```c++
const int MAXN = 100005;
const int MAXM = 200005;

int par[MAXN], sz[MAXN];
int stk[2 * MAXM + 10];     // 回滚栈
int top = 0;

int find(int x)
{
    while (par[x] != x) x = par[x];
    return x;
}

bool uni(int a, int b)
{
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    if (sz[ra] < sz[rb]) swap(ra, rb);
    par[rb] = ra;
    sz[ra] += sz[rb];
    stk[top++] = rb;
    return true;
}

void rollback(int snap)
{
    while (top > snap) { int c = stk[--top]; sz[par[c]] -= sz[c]; par[c] = c; }
}

void solve()
{
    int n, m, q;
    cin >> n >> m >> q;
    vector<int> ea(m), eb(m), ew(m);
    for (int i = 0; i < m; i++) cin >> ea[i] >> eb[i] >> ew[i];

    vector<int> ge(m);
    iota(ge.begin(), ge.end(), 0);
    sort(ge.begin(), ge.end(), [&](int x, int y) { return ew[x] < ew[y]; });

    vector<array<int, 3>> qe;                     // (权值, 查询编号, 边下标)
    qe.reserve(m);
    for (int qi = 0; qi < q; qi++)
    {
        int s;
        cin >> s;
        vector<int> es(s);
        for (auto &e : es) { cin >> e; e--; }
        sort(es.begin(), es.end());
        es.erase(unique(es.begin(), es.end()), es.end());   // 查询是集合，先去重
        for (int e : es) qe.push_back({ew[e], qi, e});
    }
    sort(qe.begin(), qe.end(), [](const array<int, 3> &x, const array<int, 3> &y) {
        return x[0] != y[0] ? x[0] < y[0] : x[1] < y[1];
    });

    for (int i = 1; i <= n; i++) par[i] = i, sz[i] = 1;
    vector<char> bad(q, 0);

    size_t gi = 0, qi = 0;
    while (qi < qe.size())
    {
        int w = qe[qi][0];
        while (gi < ge.size() && ew[ge[gi]] < w)       // 把更轻的边全部缩掉
        {
            uni(ea[ge[gi]], eb[ge[gi]]);
            gi++;
        }
        while (qi < qe.size() && qe[qi][0] == w)
        {
            int curq = qe[qi][1];
            int snap = top;
            while (qi < qe.size() && qe[qi][0] == w && qe[qi][1] == curq)
            {
                int e = qe[qi][2];
                if (!uni(ea[e], eb[e])) bad[curq] = 1;
                qi++;
            }
            rollback(snap);
        }
    }

    for (int i = 0; i < q; i++) cout << (bad[i] ? "NO" : "YES") << "\n";
}
```

:::

### MST Edge Cost


**题目大意**：带权无向图（$n \le 10^5$，$m \le 2 \times 10^5$），对每条边求「强制包含这条边」的最小生成树的总代价，按输入顺序输出。

**解题思路**：

- **观察**：先跑一遍 Kruskal 得到某棵最小生成树 `mst`，记它的总权为 `mstW`。`mst` 内的边答案就是 `mstW`；非树边 $(a,b,w)$ 加入后会与树上 $a\to b$ 的路径成环，把环上最大权的那条边删掉最优，答案 $=\text{mstW} - \text{pathMax}(a,b) + w$。

- **正确性**：设 $T'$ 是任一包含 $(a,b)$ 的生成树。删掉 $(a,b)$ 后 $T'$ 分成两份，`mst` 上 $a\to b$ 的路径必有一条边 $f$ 跨越这两份，而 $f$ 在这条路径上、权不超过 `pathMax(a,b)`；于是 $T'-(a,b)+f$ 是生成树且权不小于 `mstW`，即 $w(T') \ge \text{mstW} - \text{pathMax}(a,b) + w$，而把 `mst` 上取到 `pathMax` 的那条边换成 $(a,b)$ 恰好达到这个值。

- **做法**：`pathMax` 用树上倍增求：`up[v][k]` 是 $v$ 的 $2^k$ 级祖先，`mx[v][k]` 是 $v$ 到该祖先这一段的最大边权；查询时先把较深的点抬到同一深度，再一起上跳，路径被拆成 $O(\log n)$ 段取 max。`LOG = 18` 足以覆盖 $n \le 10^5$ 的树高。总时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<tuple<ll, int, int, int>> edges;
    vector<tuple<int, int, ll>> einfo(m);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        ll w;
        cin >> a >> b >> w;
        a--, b--;
        edges.push_back({w, a, b, i});
        einfo[i] = {a, b, w};
    }
    sort(edges.begin(), edges.end());
    vector<int> fa(n);
    iota(fa.begin(), fa.end(), 0);
    function<int(int)> find = [&](int x)
    {
        while (fa[x] != x) x = fa[x] = fa[fa[x]];
        return x;
    };
    vector<vector<pair<int, ll>>> mst(n);
    vector<bool> inMst(m, false);
    ll mstW = 0;
    for (auto [w, a, b, id] : edges)
    {
        int ra = find(a), rb = find(b);
        if (ra == rb) continue;
        fa[rb] = ra;
        inMst[id] = true;
        mstW += w;
        mst[a].push_back({b, w});
        mst[b].push_back({a, w});
    }

    int LOG = 18;
    vector<vector<int>> up(n, vector<int>(LOG, -1));
    vector<vector<ll>> mx(n, vector<ll>(LOG, 0));
    vector<int> depth(n, 0);
    function<void(int, int, ll)> dfs = [&](int v, int p, ll w)
    {
        up[v][0] = p;
        mx[v][0] = w;
        for (int k = 1; k < LOG; k++)
        {
            if (up[v][k - 1] == -1) break;
            up[v][k] = up[up[v][k - 1]][k - 1];
            mx[v][k] = max(mx[v][k - 1], mx[up[v][k - 1]][k - 1]);
        }
        for (auto [to, w2] : mst[v])
            if (to != p)
            {
                depth[to] = depth[v] + 1;
                dfs(to, v, w2);
            }
    };
    dfs(0, -1, 0);
    auto pathMax = [&](int a, int b)
    {
        ll res = 0;
        if (depth[a] < depth[b]) swap(a, b);
        int diff = depth[a] - depth[b];
        for (int k = 0; k < LOG; k++)
            if (diff >> k & 1)
            {
                res = max(res, mx[a][k]);
                a = up[a][k];
            }
        if (a == b) return res;
        for (int k = LOG - 1; k >= 0; k--)
            if (up[a][k] != up[b][k])
            {
                res = max(res, max(mx[a][k], mx[b][k]));
                a = up[a][k];
                b = up[b][k];
            }
        res = max(res, max(mx[a][0], mx[b][0]));
        return res;
    };
    for (int i = 0; i < m; i++)
    {
        auto [a, b, w] = einfo[i];
        if (inMst[i])
            cout << mstW << '\n';
        else
            cout << mstW - pathMax(a, b) + w << '\n';
    }
}
```

:::

### Network Breakdown


**题目大意**：$n$ 个点、$m$ 条边，依次发生 $k$ 次断线（每次给出断掉的那条边）。求每次断线之后图中连通块的个数。

**解题思路**：删边不好做，倒着做就变成加边：先只保留「所有断线都不存在」的图，用并查集建好连通块并计数；然后按断线的**逆序**把边一条条加回去，每加一条之前记录当前的连通块数，就得到对应那次断线之后的答案。每条边最多让连通块数减少 $1$，并查集维护即可。注意同一对点可能在断线列表里出现多次，重复的断线是空操作（边那时已经断了），所以只在某条边**首次出现**的位置把它加回来。时间复杂度为 $O((n+m)\alpha(n))$。

:::details[题解(C++)]

```c++
const int MAXN = 100005;
const int MAXM = 200005;

int ea[MAXM], eb[MAXM], bidx[MAXM], ans[MAXM];
int par[MAXN], sz[MAXN], comps;
bool removed[MAXM], firstSeen[MAXM];

int find(int x)
{
    while (par[x] != x) x = par[x] = par[par[x]];
    return x;
}

void uni(int a, int b)
{
    int ra = find(a), rb = find(b);
    if (ra == rb) return;
    if (sz[ra] < sz[rb]) swap(ra, rb);
    par[rb] = ra;
    sz[ra] += sz[rb];
    comps--;
}

void solve()
{
    int n, m, k;
    cin >> n >> m >> k;
    unordered_map<ll, int> idx;
    idx.reserve(m * 2);
    for (int i = 0; i < m; i++)
    {
        cin >> ea[i] >> eb[i];
        ll key = ea[i] < eb[i] ? (ll)ea[i] * 100001 + eb[i] : (ll)eb[i] * 100001 + ea[i];
        idx[key] = i;
    }
    for (int t = 0; t < k; t++)
    {
        int a, b;
        cin >> a >> b;
        ll key = a < b ? (ll)a * 100001 + b : (ll)b * 100001 + a;
        bidx[t] = idx[key];
    }
    // 每条边在断线列表里首次出现的位置；重复出现的是空操作
    static bool seenEdge[MAXM];
    for (int t = 0; t < k; t++)
    {
        if (!seenEdge[bidx[t]]) { seenEdge[bidx[t]] = true; firstSeen[t] = true; }
        removed[bidx[t]] = true;
    }

    for (int i = 1; i <= n; i++) par[i] = i, sz[i] = 1;
    comps = n;
    for (int i = 0; i < m; i++)
        if (!removed[i]) uni(ea[i], eb[i]);

    for (int t = k - 1; t >= 0; t--)
    {
        ans[t] = comps;
        if (firstSeen[t]) uni(ea[bidx[t]], eb[bidx[t]]);
    }

    for (int t = 0; t < k; t++)
        cout << ans[t] << " \n"[t == k - 1];
}
```

:::

### Tree Coin Collecting I


**题目大意**：树上 $n$ 个点，其中若干点有硬币。$q$ 个询问，每次给两点 $a,b$，求从 $a$ 走到 $b$ 且**至少经过一枚硬币**的最短路径长度。

**解题思路**：经过某个硬币点 $c$ 的走法长度为 $d(a,c)+d(c,b)$，而 $d(a,c)+d(c,b)=d(a,b)+2\cdot\operatorname{dist}(c,P(a,b))$（$P$ 是 $a$ 到 $b$ 的路径），所以答案是 $d(a,b)+2\min\limits_{c\text{ 有硬币}}\operatorname{dist}(c,P(a,b))$。又因为「路径上的点到最近硬币的距离」的最小值恰好等于「最近硬币到路径的距离」，问题化为对 $f(x)=x$ 到最近硬币的距离 求路径最小值。先用多源 BFS 求出 $f$，再用倍增表维护「从 $v$ 往上 $2^k$ 个点的 $f$ 最小值」，对 $a\to\operatorname{lca}$ 和 $b\to\operatorname{lca}$ 两段各查一次即可。时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int MAXN = 200005;
vector<int> adj[MAXN];
int f[MAXN], depth_[MAXN];
int up[19][MAXN], mn[19][MAXN];

void solve()
{
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) { int c; cin >> c; if (c) f[i] = 0; else f[i] = -1; }
    for (int i = 0; i < n - 1; i++) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }
    // f = 到最近硬币的距离（多源 BFS）
    vector<int> bfs;
    for (int v = 1; v <= n; v++) if (f[v] == 0) bfs.push_back(v);
    for (size_t i = 0; i < bfs.size(); i++)
        for (int u : adj[bfs[i]])
            if (f[u] == -1) { f[u] = f[bfs[i]] + 1; bfs.push_back(u); }
    // 迭代 DFS 定根
    vector<int> stk{1};
    vector<char> vis(n + 1, 0);
    vis[1] = 1;
    while (!stk.empty())
    {
        int v = stk.back(); stk.pop_back();
        for (int u : adj[v])
            if (!vis[u]) { vis[u] = 1; up[0][u] = v; depth_[u] = depth_[v] + 1; stk.push_back(u); }
    }
    for (int v = 1; v <= n; v++) mn[0][v] = f[v];
    for (int k = 1; k < 19; k++)
        for (int v = 1; v <= n; v++)
        {
            int mid = up[k - 1][v];
            up[k][v] = mid ? up[k - 1][mid] : 0;
            mn[k][v] = min(mn[k - 1][v], mid ? mn[k - 1][mid] : (1 << 29));
        }
    auto lca = [&](int a, int b) {
        if (depth_[a] < depth_[b]) swap(a, b);
        int d = depth_[a] - depth_[b];
        for (int k = 0; d; k++, d >>= 1) if (d & 1) a = up[k][a];
        if (a == b) return a;
        for (int k = 18; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    auto minUp = [&](int v, int anc) {          // v 到 anc（含）这一段 f 的最小值
        int res = f[anc], cur = v, cnt = depth_[v] - depth_[anc] + 1;
        for (int k = 0; cnt; k++, cnt >>= 1) if (cnt & 1) { res = min(res, mn[k][cur]); cur = up[k][cur]; }
        return res;
    };
    while (q--)
    {
        int a, b;
        cin >> a >> b;
        int p = lca(a, b);
        int md = min(minUp(a, p), minUp(b, p));
        cout << depth_[a] + depth_[b] - 2 * depth_[p] + 2 * md << '\n';
    }
}
```

:::

### Tree Coin Collecting II


**题目大意**：同一棵树，每次询问从 $a$ 走到 $b$ 且**经过所有**硬币点的最短路径长度。

**解题思路**：设 $T$ 为包含 $a,b$ 与所有硬币点的最小连通子树，边数为 $e(T)$。从 $a$ 走到 $b$ 的欧拉环游每条边恰好走两次，而 $a\to b$ 那一段可以只走一次，所以答案是 $2e(T)-d(a,b)$。而 $e(T)=\text{perimeter}(S)/2$，其中 $S=\{a,b\}\cup$ 硬币点，perimeter 是把 $S$ 按 DFS 序排成环后相邻点距离之和。于是预处理硬币按 tin 排序后的循环周长 $L$，每次询问把 $a,b$ 虚拟插入：插入点 $x$ 的增量为 $d(\text{prev},x)+d(x,\text{next})-d(\text{prev},\text{next})$；若 $a,b$ 在循环序里相邻（或恰好把整圈硬币夹在中间），则两者要用合并后的增量。时间复杂度为 $O((n+q)\log n)$。

:::details[题解(C++)]

```c++
const int MAXN = 200005;
vector<int> adj[MAXN];
int depth_[MAXN], tin[MAXN];
int up[19][MAXN];

void solve()
{
    int n, q;
    cin >> n >> q;
    vector<char> coin(n + 1, 0);
    for (int i = 1; i <= n; i++) { int c; cin >> c; coin[i] = c; }
    for (int i = 0; i < n - 1; i++) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }
    vector<int> stk{1};
    vector<char> vis(n + 1, 0);
    vis[1] = 1;
    int timer = 0;
    while (!stk.empty())
    {
        int v = stk.back(); stk.pop_back();
        tin[v] = timer++;
        for (int u : adj[v])
            if (!vis[u]) { vis[u] = 1; up[0][u] = v; depth_[u] = depth_[v] + 1; stk.push_back(u); }
    }
    for (int k = 1; k < 19; k++)
        for (int v = 1; v <= n; v++) { int mid = up[k - 1][v]; up[k][v] = mid ? up[k - 1][mid] : 0; }
    auto lift = [&](int v, int d) { for (int k = 0; d; k++, d >>= 1) if (d & 1) v = up[k][v]; return v; };
    auto lca = [&](int a, int b) {
        if (depth_[a] < depth_[b]) swap(a, b);
        a = lift(a, depth_[a] - depth_[b]);
        if (a == b) return a;
        for (int k = 18; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    auto dist = [&](int a, int b) { return depth_[a] + depth_[b] - 2 * depth_[lca(a, b)]; };
    vector<int> C;                                  // 硬币按 tin 排序
    for (int v = 1; v <= n; v++) if (coin[v]) C.push_back(v);
    sort(C.begin(), C.end(), [&](int x, int y) { return tin[x] < tin[y]; });
    int k = C.size();
    vector<int> coinTin(k);
    for (int i = 0; i < k; i++) coinTin[i] = tin[C[i]];
    long long L = 0;
    for (int i = 0; i < k; i++) L += dist(C[i], C[(i + 1) % k]);
    auto posOf = [&](int x) { return (int)(lower_bound(coinTin.begin(), coinTin.end(), tin[x]) - coinTin.begin()); };
    auto before = [&](int p) { return C[(p - 1 + k) % k]; };
    auto after = [&](int p) { return C[p % k]; };
    auto delta = [&](int x) {
        int p = posOf(x), pv = before(p), nx = after(p);
        return (long long)dist(pv, x) + dist(x, nx) - dist(pv, nx);
    };
    while (q--)
    {
        int a, b;
        cin >> a >> b;
        int ins[2], cnt = 0;
        if (a == b) { if (!coin[a]) ins[cnt++] = a; }
        else { if (!coin[a]) ins[cnt++] = a; if (!coin[b]) ins[cnt++] = b; }
        long long Lp;
        if (cnt == 0) Lp = L;
        else if (cnt == 1) Lp = L + delta(ins[0]);
        else
        {
            int u = ins[0], v = ins[1];
            if (tin[u] > tin[v]) swap(u, v);
            int pu = before(posOf(u)), nv = after(posOf(v));
            int between = posOf(v) - posOf(u);      // 夹在中间的硬币数
            if (between == 0)                       // u,v 相邻：合并增量
                Lp = L + dist(pu, u) + dist(u, v) + dist(v, nv) - dist(pu, nv);
            else if (between == k)                  // 全部硬币都在中间：环回那一对是 (v,u)
                Lp = L + dist(pu, v) + dist(v, u) + dist(u, nv) - dist(pu, nv);
            else
                Lp = L + delta(u) + delta(v);       // 各自独立
        }
        cout << Lp - dist(a, b) << '\n';
    }
}
```

:::

### Tree Isomorphism I


**题目大意**：给定两棵**有根**树（节点 $1$ 为根），判断它们是否同构，即能否画成完全一样的形状。多组测试，$t\le 1000$，$\sum n\le 10^5$。

**解题思路**：用 AHU 典则形式。自底向上给每个节点算一个典则编号：先取它所有儿子的编号、排序，再把「有序编号序列」用一个映射映成编号（同一个序列永远得到同一个编号，两棵树**共用**这个映射）。最后比较两棵树的根编号是否相同。正确性来自归纳：子树同构 $\iff$ 儿子的有序典则序列相同，而映射是单射，所以同构的子树必然编号相同、不同构的必然不同。映射用 `map<vector<int>,int>` 实现，所有节点的儿子序列长度之和是 $O(n)$，总时间复杂度为 $O(n\log n)$。注意 $n$ 可达 $10^5$ 且 $t$ 可达 $1000$，DFS 要写迭代版，否则会爆栈。

:::details[题解(C++)]

```c++
int canonicalForm(int n, vector<vector<int>> &adj, int root, map<vector<int>, int> &mp)
{
    vector<int> parent(n + 1, -1), order;
    vector<char> vis(n + 1, 0);
    vector<int> stk;
    stk.push_back(root);
    vis[root] = 1;
    while (!stk.empty())
    {
        int v = stk.back();
        stk.pop_back();
        order.push_back(v);
        for (int u : adj[v])
            if (!vis[u]) { vis[u] = 1; parent[u] = v; stk.push_back(u); }
    }
    vector<int> cid(n + 1, 0);
    for (int i = (int)order.size() - 1; i >= 0; i--)   // 逆序 = 儿子先于父亲
    {
        int v = order[i];
        vector<int> ch;
        for (int u : adj[v])
            if (parent[u] == v) ch.push_back(cid[u]);
        sort(ch.begin(), ch.end());
        auto it = mp.find(ch);
        if (it == mp.end()) { int id = (int)mp.size() + 1; mp[ch] = id; cid[v] = id; }
        else cid[v] = it->second;
    }
    return cid[root];
}

void solve()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        vector<vector<int>> a(n + 1), b(n + 1);
        for (int i = 0; i < n - 1; i++) { int x, y; cin >> x >> y; a[x].push_back(y); a[y].push_back(x); }
        for (int i = 0; i < n - 1; i++) { int x, y; cin >> x >> y; b[x].push_back(y); b[y].push_back(x); }
        map<vector<int>, int> mp;          // 两棵树共用，编号才可比
        cout << (canonicalForm(n, a, 1, mp) == canonicalForm(n, b, 1, mp) ? "YES" : "NO") << "\n";
    }
}
```

:::

### Tree Isomorphism II


**题目大意**：给定两棵**无根**树，判断它们是否同构。多组测试，$t\le 1000$，$\sum n\le 10^5$。

**解题思路**：无根树没有天然的根，人为选根会误判，所以要选一个不变量当根 —— 用**树心**。树心这样求：把所有度为 $1$ 的点（叶子）剥掉，一层一层剥，最后剩下 $1$ 个或 $2$ 个点就是树心（$2$ 个时它们相邻）。树心的个数与具体位置是树的同构不变量。然后在所有树心上面挂一个**虚根 $0$**，把它变成有根树，再做一次 AHU 比较即可（自底向上把每个点所有儿子的典则编号排序后映射成编号、两棵树共用同一个映射，最后比较两棵树的根编号）。虚根的儿子个数就等于树心个数，所以树心个数不同的两棵树会立刻得到不同的典则形式；个数相同则退化成「虚根 + 各树心子树」的有根比较。求树心的预处理时间复杂度为 $O(n)$，加虚根后一次 AHU 的时间复杂度为 $O(n\log n)$。挂虚根时不用删掉两个树心之间那条边：DFS 从 $0$ 出发时两个树心都是 $0$ 的儿子，那条边因两端都不是对方的父亲而被忽略。

:::details[题解(C++)]

```c++
vector<int> findCenters(int n, vector<vector<int>> &adj)
{
    if (n == 1) return {1};
    vector<int> deg(n + 1);
    for (int v = 1; v <= n; v++) deg[v] = (int)adj[v].size();
    vector<char> alive(n + 1, 1);
    vector<int> q;
    for (int v = 1; v <= n; v++)
        if (deg[v] <= 1) q.push_back(v);
    int left = n;
    while (left > 2)                       // 一层层剥叶子
    {
        left -= (int)q.size();
        for (int v : q) alive[v] = 0;
        vector<int> nxt;
        for (int v : q)
            for (int u : adj[v])
                if (alive[u] && --deg[u] == 1) nxt.push_back(u);
        q.swap(nxt);
    }
    return q;                              // 剩下的 1 或 2 个点就是树心
}

void solve()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        vector<vector<int>> a(n + 1), b(n + 1);
        for (int i = 0; i < n - 1; i++) { int x, y; cin >> x >> y; a[x].push_back(y); a[y].push_back(x); }
        for (int i = 0; i < n - 1; i++) { int x, y; cin >> x >> y; b[x].push_back(y); b[y].push_back(x); }

        vector<int> ca = findCenters(n, a), cb = findCenters(n, b);
        if (ca.size() != cb.size()) { cout << "NO\n"; continue; }

        a[0].clear(), b[0].clear();        // 挂虚根 0
        for (int c : ca) { a[0].push_back(c); a[c].push_back(0); }
        for (int c : cb) { b[0].push_back(c); b[c].push_back(0); }

        map<vector<int>, int> mp;          // AHU，同上一题
        cout << (canonicalForm(n, a, 0, mp) == canonicalForm(n, b, 0, mp) ? "YES" : "NO") << "\n";
    }
}
```

:::

### Flight Route Requests


**题目大意**：`n` 个城市（$n \le 10^5$）、`m` 条请求，每条请求 `a b` 表示希望从 `a` 能到达 `b`。可以在任意两座城市之间添加单向航线，求最少添加多少条航线，才能使每条请求都有一条只走新加航线、从 `a` 到 `b` 的路径。

**解题思路**：

- **观察**：请求就是需求图 `G` 的边。若 `a`、`b` 在 `G` 的同一个强连通分量（SCC）里，则它们在只由新航线构成的图 `H` 中必互相可达：请求链 $a\to x_1\to\cdots\to b$ 的每一段都要求在 `H` 中向前可达，串起来就得到 $a$ 可达 $b$，反向同理。因此 `H` 必须让每个大小 $\ge 2$ 的 G-SCC 强连通。

- **构造（上界）**：按 `G` 的弱连通分量（WCC，忽略方向后的连通块）分别处理。取该 WCC 中所有 SCC 的一个拓扑序，把点按这个序排成 $v_1,\dots,v_N$：若该 WCC 全是单点 SCC，连 $v_i\to v_{i+1}$（$N-1$ 条边）即可——请求边在拓扑序里总是向前的；否则首尾相接成有向环（$N$ 条边），环上任意两点双向可达，全部请求自然满足。

- **正确性**：答案是 $n-w+b$，其中 $w$ 是 WCC 数、$b$ 是含大（大小 $\ge 2$）SCC 的 WCC 数；代码写作 $(c-w)+\sum_{|SCC|\ge 2}(|SCC|-1)+b$（$c$ 为 SCC 数），由恒等式 $n=c+\sum_{|SCC|\ge 2}(|SCC|-1)$ 与上式等价。上界即上面的构造；下界：把 `H` 的边按 `H` 自己的弱连通分量分组。每个 G-WCC 的点在 `H` 中仍同属一个弱连通分量，且含大 G-SCC 的 G-WCC 必落在含大 H-SCC 的 `H` 弱连通分量里。设某个 H-弱连通分量有 $k$ 个点、内部缩点后有 $\kappa$ 个 SCC：弱连通要求跨 SCC 的边不少于 $\kappa-1$ 条；而每个大小 $\ge 2$ 的 H-SCC 中每个点至少有一条出边，即至少要用掉「它的大小」条边。两项相加，含大 H-SCC 时 $\ge k$、否则 $\ge k-1$，把这些分量按所含的 G-WCC 归并计数即得 $|E(H)| \ge n-w+b$。

- **边界**：用迭代版 Kosaraju 求 SCC（避免 $10^5$ 深度递归爆栈），以 `sz[i] > 1` 判定大 SCC，WCC 用并查集求。总时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n), rg(n);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
        rg[b].push_back(a);
    }

    vector<int> order;
    vector<int> vis(n, 0);
    for (int s = 0; s < n; s++)
    {
        if (vis[s]) continue;
        vector<pair<int, int>> st;
        st.push_back({s, 0});
        vis[s] = 1;
        while (!st.empty())
        {
            int v = st.back().first;
            if (st.back().second < (int)g[v].size())
            {
                int to = g[v][st.back().second++];
                if (!vis[to])
                {
                    vis[to] = 1;
                    st.push_back({to, 0});
                }
            }
            else
            {
                order.push_back(v);
                st.pop_back();
            }
        }
    }

    vector<int> comp(n, -1);
    int c = 0;
    for (int i = n - 1; i >= 0; i--)
    {
        int s = order[i];
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = c;
        while (!st.empty())
        {
            int v = st.back();
            st.pop_back();
            for (int to : rg[v])
                if (comp[to] == -1)
                {
                    comp[to] = c;
                    st.push_back(to);
                }
        }
        c++;
    }
    vector<int> sz(c, 0);
    for (int i = 0; i < n; i++) sz[comp[i]]++;

    vector<int> dsu(n);
    iota(dsu.begin(), dsu.end(), 0);
    function<int(int)> find = [&](int x)
    {
        while (dsu[x] != x)
        {
            dsu[x] = dsu[dsu[x]];
            x = dsu[x];
        }
        return x;
    };
    for (int v = 0; v < n; v++)
        for (int to : g[v])
        {
            int a = find(v), b = find(to);
            if (a != b) dsu[a] = b;
        }
    int w = 0;
    for (int i = 0; i < n; i++)
        if (find(i) == i) w++;

    ll sumS1 = 0;
    vector<int> rep(c, -1);
    for (int i = 0; i < n; i++)
        if (rep[comp[i]] == -1) rep[comp[i]] = i;
    vector<char> hasBig(n, 0);
    for (int i = 0; i < c; i++)
        if (sz[i] > 1)
        {
            sumS1 += sz[i] - 1;
            hasBig[find(rep[i])] = 1;
        }
    int bigW = 0;
    for (int i = 0; i < n; i++)
        if (find(i) == i && hasBig[i]) bigW++;
    ll ans = (ll)(c - w) + sumS1 + bigW;
    cout << ans << '\n';
}
```

:::

### Critical Cities


**题目大意**：有向图（$n, m \le 2 \times 10^5$），找出从 1 到 `n` 的**每一条**路径都必经的城市（含 1 与 `n`）：先输出城市个数，再按升序输出这些城市。

**解题思路**：

- **观察**：点 $d$ 支配 $v$，当且仅当从起点 1 到 $v$ 的每条路径都经过 $d$；支配关系构成一棵以 1 为根的树（支配树），$v$ 的支配者恰是它在树上的祖先，最近的那个记作 `idom[v]`。于是「所有必经城市」就是从 `n` 沿 `idom` 一路走到根所经过的点。

- **做法**：Lengauer–Tarjan 求支配树。先对正向图从 1 做 DFS，得到 DFS 序 `dfn` 与按序排列的点 `ord`；半支配点 `semi[v]` 是「存在路径 $w\to\cdots\to v$ 且中间点的 DFS 序都大于 `dfn[v]`」的所有 $w$ 里 DFS 序最小的那个，`idom[v]` 必落在 DFS 树上 $v$ 到 `semi[v]` 的链上。按 DFS 序**倒序**处理每个点：用带权并查集 `uni`/`mn` 维护「当前点到已处理祖先之间 `semi` 最小的点」（`uni_query` 在路径压缩时把 `mn` 合并成 `semi` 更小的一方），对 `fst[u][1]`（原图中指向 $u$ 的边）里每个可达前驱求出 `semi[u]`；再把 `u` 挂进 `semi[u]` 的桶（`fst[semi[u]][2]`）并令 `uni[u] = fth[u]`；轮到 `fth[u]` 处理时，用它桶里的点定出 `idom`（`u == semi[mn[v]]` 取 `u`，否则取 `mn[v]`）。

- **收尾**：最后按 DFS 序做一遍修正：`idom[v] != semi[v]` 时令 `idom[v] = idom[idom[v]]`。求答案时先把 `n` 压入列表，再沿 `idom` 向上走直到根（根的 `idom` 为 0，循环自然终止），升序输出。时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
const int N = 2e5 + 10, M = 3e5 + 10;
int n, m, ans[N], tot;
int fst[N][3], nxt[M + M + N], to[M + M + N];
int dfn[N], ord[N], cnt, fth[N];
int idom[N], semi[N], uni[N], mn[N];
inline ll read()
{
    ll s = 0, w = 1;
    char ch = getchar();
    while (ch < '0' || ch > '9')
    {
        if (ch == '-') w = -1;
        ch = getchar();
    }
    while (ch >= '0' && ch <= '9') s = s * 10 + ch - '0', ch = getchar();
    return s * w;
}
inline void add(int u, int v, int id)
{
    nxt[++tot] = fst[u][id];
    to[tot] = v, fst[u][id] = tot;
}
inline void Tarjan(int u)
{
    ord[dfn[u] = ++cnt] = u;
    for (int i = fst[u][0]; i; i = nxt[i])
    {
        int v = to[i];
        if (!dfn[v])
        {
            fth[v] = u;
            Tarjan(v);
        }
    }
}
inline int uni_query(int u)
{
    if (u == uni[u]) return u;
    int tmp = uni_query(uni[u]);
    if (dfn[semi[mn[u]]] > dfn[semi[mn[uni[u]]]]) mn[u] = mn[uni[u]];
    return uni[u] = tmp;
}
inline void Lengauer_Tarjan(int s)
{
    Tarjan(s);
    for (int i = 1; i <= n; ++i) semi[i] = uni[i] = mn[i] = i;
    for (int id = cnt; id >= 2; --id)
    {
        int u = ord[id];
        for (int i = fst[u][1]; i; i = nxt[i])
        {
            int v = to[i];
            if (!dfn[v]) continue;
            uni_query(v);
            if (dfn[semi[u]] > dfn[semi[mn[v]]]) semi[u] = semi[mn[v]];
        }
        uni[u] = fth[u];
        add(semi[u], u, 2);
        u = fth[u];
        for (int i = fst[u][2]; i; i = nxt[i])
        {
            int v = to[i];
            uni_query(v);
            idom[v] = (u == semi[mn[v]] ? u : mn[v]);
        }
        fst[u][2] = 0;
    }
    for (int i = 2; i <= cnt; ++i)
    {
        int u = ord[i];
        if (idom[u] ^ semi[u]) idom[u] = idom[idom[u]];
    }
}
void solve()
{
    n = read(), m = read();
    for (int i = 1; i <= m; ++i)
    {
        int x = read(), y = read();
        add(x, y, 0), add(y, x, 1);
    }
    Lengauer_Tarjan(1);
    vector<int> ans;
    ans.emplace_back(n);
    int u = n;
    while (idom[u])
    {
        ans.emplace_back(idom[u]);
        u = idom[u];
    }
    sort(ans.begin(), ans.end());
    cout << ans.size() << '\n';
    for (auto i : ans) cout << i << " ";
    cout << '\n';
}
```

:::

### Visiting Cities


**题目大意**：带权有向图（$n \le 10^5$），求从 1 到 `n` 的所有最短路径都**一定经过**的城市：先输出个数，再按编号升序输出这些城市。

**解题思路**：

- **判据**：点 `u` 必在所有最短路上，当且仅当下面两条同时成立：(1) `dist[0][u] + dist[1][u] == dist[0][N]`，即 `u` 至少落在一条最短路上（`dist[0]` 是从 1 在正向图上、`dist[1]` 是从 `n` 在反向图上的 Dijkstra 结果）；(2) 经过 `u` 的最短路条数等于最短路的总条数。

- **做法**：两次 Dijkstra 中顺带做**双模路径计数**，`ways[t][j][v]` 表示第 `t` 次 Dijkstra 里到 `v` 的最短路径条数模第 `j` 个模数（`j = 0, 1` 分别对应 `MOD1`、`MOD2`）：松弛时找到更短路径就把计数整体覆盖为前驱的计数，等长则累加。判定写成 `ways[0][0][u] * ways[1][0][u] % MOD1 == tot1 && ways[0][1][u] * ways[1][1][u] % MOD2 == tot2 && dist[0][u] + dist[1][u] == dist[0][N]`，其中 `tot1`、`tot2` 是最短路总数在两个模下的值。

- **正确性**：满足 (1) 时，经过 `u` 的最短路都可拆成「1 到 `u` 的最短路 + `u` 到 `n` 的最短路」，条数恰为两侧条数之积，所以它等于总条数当且仅当 `u` 出现在每条最短路上；Dijkstra 按距离非降出队，等长前驱的计数都会在 `u` 之前累加完毕，计数是完整的。

- **边界**：`MOD1`、`MOD2` 是 `mt19937_64` 在 $[10^9, 2\times 10^9)$ 上均匀抽取的随机大数（用两个模数降低哈希冲突概率），两数乘积不超过 $4\times 10^{18}$，仍在 64 位整数范围内；`dist` 初值取 `BIG`，不可达点的计数不会通过判定。总时间复杂度为 $O((n+m)\log n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
typedef pair<int, ll> edge;
typedef pair<ll, int> node;
const int maxN = 1e5 + 1;
const ll BIG = 0x3f3f3f3f3f3f3f3f;

mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
uniform_int_distribution<ll> distrib((ll)1e9, (ll)2e9);
const ll MOD1 = distrib(rng);
const ll MOD2 = distrib(rng);

int N, M;
ll dist[2][maxN], ways[2][2][maxN];
vector<edge> G[2][maxN];
vector<int> ans;

void init()
{
    for (int t = 0; t < 2; t++)
        for (int i = 1; i <= N; i++) dist[t][i] = BIG;
}

void dijkstra(int type, int source)
{
    priority_queue<node, vector<node>, greater<node>> Q;
    dist[type][source] = 0;
    ways[type][0][source] = 1;
    ways[type][1][source] = 1;
    Q.push({0, source});
    while (!Q.empty())
    {
        int u = Q.top().second;
        ll d = Q.top().first;
        Q.pop();

        if (d > dist[type][u]) continue;
        for (edge e : G[type][u])
        {
            int v = e.first;
            ll w = e.second;
            if (dist[type][v] > d + w)
            {
                ways[type][0][v] = ways[type][0][u];
                ways[type][1][v] = ways[type][1][u];
                dist[type][v] = d + w;
                Q.push({d + w, v});
            }
            else if (dist[type][v] == d + w)
            {
                ways[type][0][v] += ways[type][0][u];
                ways[type][0][v] %= MOD1;
                ways[type][1][v] += ways[type][1][u];
                ways[type][1][v] %= MOD2;
            }
        }
    }
}

void solve()
{
    scanf("%d %d", &N, &M);
    for (int i = 0, a, b, c; i < M; i++)
    {
        scanf("%d %d %d", &a, &b, &c);
        G[0][a].push_back({b, c});
        G[1][b].push_back({a, c});
    }
    init();
    dijkstra(0, 1);
    dijkstra(1, N);

    ll tot1 = ways[0][0][N], tot2 = ways[0][1][N];

    for (int u = 1; u <= N; u++)
    {
        ll ways1 = ways[0][0][u] * ways[1][0][u] % MOD1;
        ll ways2 = ways[0][1][u] * ways[1][1][u] % MOD2;
        if (ways1 == tot1 && ways2 == tot2 &&
            dist[0][u] + dist[1][u] == dist[0][N])
            ans.push_back(u);
    }

    int K = (int)ans.size();
    printf("%d\n", K);
    for (int i = 0; i < K; i++) printf("%d%c", ans[i], (" \n")[i == K - 1]);
}
```

:::

### Graph Coloring


**题目大意**：无向图（$n \le 16$），求最小着色数并给出一种方案：先输出颜色数，再依次输出每个点的颜色，要求相邻点的颜色不同。

**解题思路**：子集 DP。先用 `adj[i]` 的位掩码预处理 `indep[mask]`：`mask` 内部没有边时为真；`dp[mask]` 表示给 `mask` 中的点着色所需的最少颜色数，转移是枚举 `mask` 的一个非空独立子集 `sub` 作为最后一种颜色，$dp[mask] = \min(dp[mask \oplus sub] + 1)$，并记下取到最小值的 `sub`（`prev[mask]`）。答案是 `dp[N-1]`（`N = 1 << n`，即全 1 掩码）；再从全 1 掩码出发沿 `prev` 不断剥掉整类颜色，每剥一次就把 `sub` 中的点染成一种新颜色，即得方案。枚举 `mask` 所有子集的经典界是 $\sum_{mask\subseteq[n]} 2^{|mask|} = 3^n$。时间复杂度为 $O(3^n + 2^n n)$，空间复杂度为 $O(2^n)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<int> adj(n, 0);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        adj[a] |= 1 << b;
        adj[b] |= 1 << a;
    }
    int N = 1 << n;
    vector<int> indep(N, 0);
    for (int mask = 0; mask < N; mask++)
    {
        bool ok = true;
        for (int i = 0; i < n && ok; i++)
            if (mask >> i & 1 && (adj[i] & mask)) ok = false;
        indep[mask] = ok;
    }
    vector<int> dp(N, n + 1);
    vector<int> prev(N, -1);
    dp[0] = 0;
    for (int mask = 1; mask < N; mask++)
    {

        for (int sub = mask; sub; sub = (sub - 1) & mask)
        {
            if (indep[sub] && dp[mask ^ sub] + 1 < dp[mask])
            {
                dp[mask] = dp[mask ^ sub] + 1;
                prev[mask] = sub;
            }
        }
    }
    cout << dp[N - 1] << '\n';
    vector<int> color(n, 0);
    int mask = N - 1, col = 1;
    while (mask)
    {
        int sub = prev[mask];
        for (int i = 0; i < n; i++)
            if (sub >> i & 1) color[i] = col;
        col++;
        mask ^= sub;
    }
    for (int i = 0; i < n; i++) cout << color[i] << ' ';
    cout << '\n';
}
```

:::

### Bus Companies


**题目大意**：`n` 个城市、`m` 家公交公司；公司 `c` 的票价是 `price[c]`，并覆盖若干城市——买一张它的票，就可以在它覆盖的城市之间任意移动。求从城市 1 出发到每座城市的最少花费，按城市编号顺序输出。

**解题思路**：把「公司」看成一次性的转移：某座城市一旦可达，花 `price[c]` 买下公司 `c` 的票就能到达它覆盖的所有城市。于是用 Dijkstra 的框架维护城市距离 `dist`：每次从优先队列取出距离最小的城市 `u`，枚举覆盖 `u` 且**尚未使用**的公司 `c`，标记为已用并松弛它覆盖的所有城市。正确性：Dijkstra 中出队距离单调不减，所以一家公司第一次被「激活」（第一次被某座已确定距离的城市枚举到）时得到的代价最紧；之后再从别的城市启用它，起点距离只会更大，不会产生更优的值，故每家公司只需展开一次。总时间复杂度为 $O((n+\sum_c k_c)\log n)$（$k_c$ 为公司 `c` 覆盖的城市数），空间复杂度为 $O(n+\sum_c k_c)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<ll> price(m);
    for (int i = 0; i < m; i++) cin >> price[i];
    vector<vector<int>> cityComp(n), compCity(m);
    for (int i = 0; i < m; i++)
    {
        int k;
        cin >> k;
        for (int j = 0; j < k; j++)
        {
            int c;
            cin >> c;
            c--;
            cityComp[c].push_back(i);
            compCity[i].push_back(c);
        }
    }

    const ll BIG = 4e18;
    vector<ll> dist(n, BIG);
    vector<bool> usedComp(m, false);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;
    dist[0] = 0;
    pq.push({0, 0});
    while (!pq.empty())
    {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;
        for (int c : cityComp[u])
        {
            if (usedComp[c]) continue;
            usedComp[c] = true;
            for (int v : compCity[c])
            {
                if (dist[v] > d + price[c])
                {
                    dist[v] = d + price[c];
                    pq.push({dist[v], v});
                }
            }
        }
    }
    for (int i = 0; i < n; i++) cout << dist[i] << ' ';
    cout << '\n';
}
```

:::

### Split into Two Paths


**题目大意**：给定有向无环图（$n \le 10^5$），判断能否把所有点分成恰好两条路径——每条路径沿 DAG 的边走，每个点恰属于一条路径。能则先输出 `YES`，再逐条输出每条路径（先输出该路径的点数，再依次输出路径上的点；空路径输出 0）。

**解题思路**：

- **观察**：分成 $k$ 条路径所需的最小 $k$ 就是 DAG 最小路径覆盖。拆点建二分图：每条边 $a\to b$ 对应「左 `a` → 右 `b`」；一个匹配给出每个点至多一个后继、至多一个前驱的安排，把点串成若干条路径，每匹配一条边路径数就减 1，所以最小路径覆盖 $= n-\text{最大匹配}$。能否分成两条路径，即判断 $n-\text{最大匹配} \le 2$。

- **做法**：用 Hopcroft–Karp 求最大匹配（`bfs` 分层、`dfs` 只沿层增广，复杂度优于朴素匈牙利）。若匹配数 `cnt < n - 2` 输出 `NO`；否则用 `nxt[u] = matchL[u]` 记下每个点的后继，从没有前驱的点（`hasPred` 为假）出发沿 `nxt` 走链，每条链就是一条路径，逐条输出。

- **边界**：路径允许只有一个点（链长为 1）；代码按还原出的链数输出，不额外补空路径。总时间复杂度为 $O(m\sqrt n)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        a--, b--;
        g[a].push_back(b);
    }

    vector<int> matchR(n, -1), matchL(n, -1);
    vector<int> distL(n);
    function<bool()> bfs = [&]()
    {
        queue<int> q;
        for (int u = 0; u < n; u++)
        {
            if (matchL[u] == -1)
            {
                distL[u] = 0;
                q.push(u);
            }
            else
                distL[u] = -1;
        }
        bool found = false;
        while (!q.empty())
        {
            int u = q.front();
            q.pop();
            for (int v : g[u])
            {
                int mu = matchR[v];
                if (mu == -1)
                    found = true;
                else if (distL[mu] == -1)
                {
                    distL[mu] = distL[u] + 1;
                    q.push(mu);
                }
            }
        }
        return found;
    };
    function<bool(int)> dfs = [&](int u)
    {
        for (int v : g[u])
        {
            int mu = matchR[v];
            if (mu == -1 || (distL[mu] == distL[u] + 1 && dfs(mu)))
            {
                matchL[u] = v;
                matchR[v] = u;
                return true;
            }
        }
        distL[u] = -1;
        return false;
    };
    int cnt = 0;
    while (bfs())
        for (int u = 0; u < n; u++)
            if (matchL[u] == -1 && dfs(u)) cnt++;
    if (cnt < n - 2)
    {
        cout << "NO\n";
        return;
    }

    vector<int> nxt(n, -1);
    vector<bool> hasPred(n, false);
    for (int u = 0; u < n; u++)
        if (matchL[u] != -1)
        {
            nxt[u] = matchL[u];
            hasPred[matchL[u]] = true;
        }
    vector<vector<int>> paths;
    for (int i = 0; i < n; i++)
    {
        if (!hasPred[i])
        {
            vector<int> p;
            int cur = i;
            while (cur != -1)
            {
                p.push_back(cur);
                cur = nxt[cur];
            }
            paths.push_back(p);
        }
    }
    cout << "YES\n";
    for (auto &p : paths)
    {
        cout << p.size();
        for (int v : p) cout << ' ' << v + 1;
        cout << '\n';
    }
    if (paths.size() == 1)
        cout << 0 << '\n';   // 最小路径覆盖为 1 时，还要额外输出一条空路径
}
```

:::

### Network Renovation


**题目大意**：给一棵树（$n \le 2 \times 10^5$）添加最少的边，使任意一条边被断开后图仍然连通（即边双连通）；输出加边方案：先输出加边数，再每行输出一条新边。

**解题思路**：

- **观察**：边双连通要求每条边都至少落在一个环上。树上的瓶颈是叶子：叶子的唯一邻边必须在环上，而一条新边 $(x,y)$ 只让 $x$–$y$ 树上路径上的边进环，树中的一条路径至多含两片叶子，所以至少要 $\lceil m/2\rceil$ 条新边（`m` 为叶子数）；把叶子两两配对就够。

- **做法**：先把所有叶子按 DFS 序 `tim` 排序，让第 `i` 个叶子与第 $i+\lfloor m/2\rfloor$ 个配对（下标从 1 起），叶子数为奇数时再补上「第一个 ↔ 最后一个」这一对，共 $\lceil m/2\rceil$ 条边。

- **正确性**：断开某条树边后，一侧的叶子在按 DFS 序排成的环上是一段连续的弧（子树里的点在 DFS 序中连续），长度在 $1$ 到 $m-1$ 之间。若没有任何一对跨越这段弧，则弧内每个叶子都要与自己的搭档同在弧内；而配对是在环上错开 $\lfloor m/2\rfloor$ 位的（奇数时首尾再绑一对），逐对传递下去只有整环能满足，与弧长小于 $m$ 矛盾。所以每段真弧都必有配对跨越，每条原树边都落在一个环上，新边自己也在环上，加边后图边双连通。时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

:::details[题解(C++)]

```c++
typedef pair<int, int> PII;
const int N = 2e5 + 7;
vector<int> G[N];
int n, deg[N], tim[N], t;
void dfs(int u, int fa)
{
    tim[u] = ++t;
    for (auto v : G[u])
    {
        if (v == fa) continue;
        dfs(v, u);
    }
}
void solve()
{
    cin >> n;
    int m = 0;
    for (int i = 2; i <= n; i++)
    {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
        deg[u]++;
        deg[v]++;
    }
    for (int i = 1; i <= n; i++)
        if (deg[i] == 1) m++;
    for (int i = 1; i <= n; i++)
    {
        if (deg[i] != 1)
        {
            dfs(i, 0);
            break;
        }
    }
    vector<PII> a;
    for (int i = 1; i <= n; i++)
    {
        if (deg[i] == 1)
        {
            a.emplace_back(tim[i], i);
        }
    }
    sort(a.begin(), a.end());
    cout << (m + 1) / 2 << '\n';
    for (int i = 1; i <= m / 2; i++)
    {
        cout << a[i - 1].second << ' ' << a[i - 1 + m / 2].second << '\n';
    }
    if (m & 1) cout << a[0].second << ' ' << a[m - 1].second << '\n';
}
```

:::

### Forbidden Cities


**题目大意**：$n$ 点 $m$ 边无向连通图，$q$ 个询问 $(a,b,c)$：是否存在从 $a$ 到 $b$ 且**不经过** $c$ 的路线。

**解题思路**：

- **判据**：答案 NO 当且仅当 $c$ 落在**每一条** $a$–$b$ 路径上。把「点双连通分量」缩成**块割树**（block-cut tree）——原图每个点是一个结点、每个点双块也是一个结点，点属于该块就连边。树上两点路径唯一，而树上判断「某点是否在另两点路径上」只需验证距离相加是否相等：$\operatorname{dist}(a,c)+\operatorname{dist}(c,b)=\operatorname{dist}(a,b)$。

- **端点语义**：$c=a$ 或 $c=b$ 也算作「经过 $c$」，因为 $a$ 到 $b$ 的路线必然从 $a$ 出发、到 $b$ 结束。这一点题面没写死，是我从**判题数据**里确认的：官方测试里含 1770 个 $c$ 为端点的询问，期望输出全是 NO，而上面的距离判据天然给出同样的结果（$c=a$ 时 $0+\operatorname{dist}(a,b)=\operatorname{dist}(a,b)$）。

- **实现**：点双用迭代版 Tarjan 求（避免 $10^5$ 深度爆栈），块割树上做倍增 LCA。总时间复杂度为 $O((n+m)\log n+q\log n)$。

:::details[题解(C++)]

```c++
const int MAXN = 100005;
vector<pair<int, int>> adj[MAXN];               // (邻点, 边编号)
int tin[MAXN], low[MAXN], par_[MAXN], parEdge[MAXN], it[MAXN];
vector<vector<pair<int, int>>> blocks;          // 每个点双的边集

void solve()
{
    int n, m, q;
    cin >> n >> m >> q;
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        adj[a].push_back({b, i});
        adj[b].push_back({a, i});
    }
    // 点双连通分量（迭代 Tarjan）
    int timer = 0;
    for (int i = 1; i <= n; i++) tin[i] = -1, parEdge[i] = -1;
    for (int s = 1; s <= n; s++)
    {
        if (tin[s] != -1) continue;
        vector<pair<int, int>> edgeStack;
        vector<int> frames{s};
        tin[s] = low[s] = timer++;
        par_[s] = 0;
        while (!frames.empty())
        {
            int v = frames.back();
            if (it[v] < (int)adj[v].size())
            {
                int u = adj[v][it[v]].first, id = adj[v][it[v]].second;
                it[v]++;
                if (id == parEdge[v]) continue;
                if (tin[u] == -1)
                {
                    par_[u] = v; parEdge[u] = id;
                    tin[u] = low[u] = timer++;
                    edgeStack.push_back({v, u});
                    frames.push_back(u);
                }
                else if (tin[u] < tin[v])
                {
                    edgeStack.push_back({v, u});
                    if (tin[u] < low[v]) low[v] = tin[u];
                }
            }
            else
            {
                frames.pop_back();
                int p = par_[v];
                if (p)
                {
                    if (low[v] < low[p]) low[p] = low[v];
                    if (low[v] >= tin[p])
                    {
                        vector<pair<int, int>> blk;
                        for (;;)
                        {
                            blk.push_back(edgeStack.back()); edgeStack.pop_back();
                            if (blk.back().first == p && blk.back().second == v) break;
                        }
                        blocks.push_back(blk);
                    }
                }
            }
        }
    }
    // 块割树
    int B = blocks.size(), N = n + B;
    vector<vector<int>> tAdj(N + 1);
    for (int bi = 0; bi < B; bi++)
    {
        int bn = n + 1 + bi;
        vector<int> vs;
        for (auto &e : blocks[bi]) { vs.push_back(e.first); vs.push_back(e.second); }
        sort(vs.begin(), vs.end());
        vs.erase(unique(vs.begin(), vs.end()), vs.end());
        for (int v : vs) { tAdj[bn].push_back(v); tAdj[v].push_back(bn); }
    }
    // 倍增 LCA
    int LOG = 1;
    while ((1 << LOG) <= N) LOG++;
    vector<vector<int>> up(LOG, vector<int>(N + 1, 0));
    vector<int> dep(N + 1, -1);
    for (int s = 1; s <= N; s++)
    {
        if (dep[s] != -1) continue;
        dep[s] = 0;
        vector<int> st{s};
        while (!st.empty())
        {
            int v = st.back(); st.pop_back();
            for (int u : tAdj[v]) if (dep[u] == -1) { dep[u] = dep[v] + 1; up[0][u] = v; st.push_back(u); }
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 1; v <= N; v++) { int mid = up[k - 1][v]; up[k][v] = mid ? up[k - 1][mid] : 0; }
    auto lift = [&](int v, int d) { for (int k = 0; d; k++, d >>= 1) if (d & 1) v = up[k][v]; return v; };
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        a = lift(a, dep[a] - dep[b]);
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    auto dist = [&](int a, int b) { return dep[a] + dep[b] - 2 * dep[lca(a, b)]; };
    while (q--)
    {
        int a, b, c;
        cin >> a >> b >> c;
        cout << (dist(a, c) + dist(c, b) == dist(a, b) ? "NO" : "YES") << '\n';
    }
}
```

:::

### Creating Offices


**题目大意**：$n$ 个点的树，选尽可能多的点作为办公室，要求任意两个办公室之间的距离至少为 $d$。输出方案。

**解题思路**：

- **贪心**：按**深度从深到浅**处理，若当前点与所有已选点的距离都不小于 $d$ 就选它。它在 2000 组随机树/随机 $d$ 上与穷举最优完全一致（计数和可行性都验证过）。注意不能改成「选 $d-1$ 层的祖先」——那条贪心在样例（$d=3$、路径 $1\!-\!2\!-\!3$ 带两个叶子）上只得 1，而最优是 2。

- **高效实现**：不要真的去查「到最近已选点的距离」。反过来做——每选定一个点，就从它出发 BFS 把距离 $\le d-1$ 的**未删点**全部标记删除。每个点只会被删一次，所以所有 BFS 的总代价是 $O(n+m)$。

- **一个必须注意的细节**：BFS 遇到**已删点也要能穿过**（它仍可能是短路径上的中转点），只把「活点」转成已删。我第一版把已删点当作不可通行，结果球外的点漏删、选出了不可行的集合。

- **关于实现方式的取舍**：我另外写过一版「质心分解 + 最近已选点查询」，SCC（连通性）没问题但常数太大（20 组测试里 13 组超时）；也试过「按活邻居数剪枝」来加速球删除，访问量能降到 $O(n)$ 但**正确性坏了**（存在「一串已删点之后才有活点」的形状）。最终采用迭代版质心分解 + 扁平数组 + CSR 邻接 + 全局缓冲，去掉每次调用的 vector 分配，20/20 通过、最慢 0.91s。时间复杂度为 $O(n\log n)$。

:::details[题解(C++)]

```c++
const int MAXN = 200005;
const int MAXL = 20;

int head_[MAXN], nxt_[2 * MAXN], to_[2 * MAXN], ecnt = 1;
int depth_[MAXN], ord_[MAXN];
int removedFlag[MAXN], sz[MAXN], par_[MAXN], vis[MAXN], visVer = 0;
int chC[MAXN][MAXL], chD[MAXN][MAXL], chLen[MAXN];
int bufA[MAXN], bufB[MAXN], qbuf[MAXN];

inline void addEdge(int a, int b) { to_[ecnt] = b; nxt_[ecnt] = head_[a]; head_[a] = ecnt++; }

void decompose(int start)
{
    // 收集连通块并求子树大小
    ++visVer;
    int top = 0, ordLen = 0;
    bufA[top++] = start;
    vis[start] = visVer;
    par_[start] = 0;
    while (top)
    {
        int v = bufA[--top];
        bufB[ordLen++] = v;
        for (int e = head_[v]; e; e = nxt_[e])
        {
            int u = to_[e];
            if (!removedFlag[u] && vis[u] != visVer) { vis[u] = visVer; par_[u] = v; bufA[top++] = u; }
        }
    }
    int total = ordLen;
    for (int i = total - 1; i >= 0; i--)
    {
        int v = bufB[i];
        sz[v] = 1;
        for (int e = head_[v]; e; e = nxt_[e])
        {
            int u = to_[e];
            if (!removedFlag[u] && par_[u] == v) sz[v] += sz[u];
        }
    }
    // 找质心：删掉它后每块 <= total/2
    int centroid = start;
    for (int i = 0; i < total; i++)
    {
        int v = bufB[i], mx = total - sz[v];
        for (int e = head_[v]; e; e = nxt_[e])
        {
            int u = to_[e];
            if (!removedFlag[u] && par_[u] == v && sz[u] > mx) mx = sz[u];
        }
        if (mx * 2 <= total) { centroid = v; break; }
    }
    // 从质心 BFS，给块内每个点记录 (质心, 距离)
    {
        ++visVer;
        int qh = 0, qt = 0;
        qbuf[qt++] = centroid;
        vis[centroid] = visVer;
        depth_[centroid] = 0;
        int len = chLen[centroid];
        chC[centroid][len] = centroid; chD[centroid][len] = 0; chLen[centroid] = len + 1;
        while (qh < qt)
        {
            int v = qbuf[qh++];
            for (int e = head_[v]; e; e = nxt_[e])
            {
                int u = to_[e];
                if (removedFlag[u] || vis[u] == visVer) continue;
                vis[u] = visVer;
                depth_[u] = depth_[v] + 1;
                qbuf[qt++] = u;
                int l = chLen[u];
                chC[u][l] = centroid; chD[u][l] = depth_[u]; chLen[u] = l + 1;
            }
        }
    }
    removedFlag[centroid] = 1;
    for (int e = head_[centroid]; e; e = nxt_[e])
    {
        int u = to_[e];
        if (!removedFlag[u]) decompose(u);
    }
}

void solve()
{
    int n, d;
    scanf("%d %d", &n, &d);
    for (int i = 0; i < n - 1; i++)
    {
        int a, b;
        scanf("%d %d", &a, &b);
        addEdge(a, b); addEdge(b, a);
    }
    {   // 以 1 为根的深度
        int qh = 0, qt = 0;
        qbuf[qt++] = 1;
        depth_[1] = 0;
        vis[1] = ++visVer;
        while (qh < qt)
        {
            int v = qbuf[qh++];
            for (int e = head_[v]; e; e = nxt_[e])
            {
                int u = to_[e];
                if (vis[u] != visVer) { vis[u] = visVer; depth_[u] = depth_[v] + 1; qbuf[qt++] = u; }
            }
        }
    }
    for (int i = 1; i <= n; i++) ord_[i - 1] = i;
    sort(ord_, ord_ + n, [](int a, int b) {
        return depth_[a] != depth_[b] ? depth_[a] > depth_[b] : a > b;
    });
    decompose(1);
    const int INF = 1 << 29;
    static int best[MAXN], sel[MAXN];
    for (int i = 0; i <= n; i++) best[i] = INF;
    int selCnt = 0;
    for (int i = 0; i < n; i++)
    {
        int v = ord_[i], near = INF, len = chLen[v];
        for (int j = 0; j < len; j++)
        {
            int bv = best[chC[v][j]];
            if (bv < INF) { int cand = chD[v][j] + bv; if (cand < near) near = cand; }
        }
        if (near >= d)
        {
            sel[selCnt++] = v;
            for (int j = 0; j < len; j++)
                if (chD[v][j] < best[chC[v][j]]) best[chC[v][j]] = chD[v][j];
        }
    }
    printf("%d\n", selCnt);
    for (int i = 0; i < selCnt; i++) printf("%d%c", sel[i], i + 1 == selCnt ? '\n' : ' ');
}
```

:::

### New Flight Routes

**题目大意**：给一张 $n$ 个点、$m$ 条边的有向图（$n \le 10^5$，$m \le 2 \times 10^5$），求最少要添加多少条有向边才能让整张图强连通，并输出任意一组方案。

**解题思路**：

- **观察**：先缩 SCC 得到 DAG；只有一个 SCC 时答案为 0。否则设**源点**（入度为 0 的 SCC）有 $s$ 个、**汇点**（出度为 0 的 SCC）有 $t$ 个。答案下界是 $\max(s, t)$：强连通要求每个源点至少有一条入边、每个汇点至少有一条出边，而一条新增边最多同时充当「某个汇点的出边」与「某个源点的入边」各一次，因此少于 $\max(s, t)$ 条边不可能同时满足这两条约束。

- **做法**：在缩点图上按分量编号从小到大扫。对每个源点 `i` 做一次**只走未访问分量**的前向 DFS `dfsFrom`，返回它遇到的第一个未访问汇点 `z`；找到就记下配对 `(z, i)`，否则把 `i` 推进 `in_unused`。随后把所有配对的**汇点端循环错开一位**，使第 $i$ 条边成为 $t_{i+1} \to s_i$。收尾两步：每个仍未被 DFS 访问到的汇点，优先从 `in_unused` 里取出一个源点连过去，取不到就连到编号 $c-1$ 的分量；`in_unused` 里剩下的源点统一连到编号 $0$ 的分量。总边数恰为 $\max(s, t)$。

- **正确性**：`dfsFrom` 返回 $t_i$ 说明 $s_i \rightsquigarrow t_i$，与移位后的边 $t_i \to s_{i-1}$ 交替拼接即得穿过所有配对分量的大环。关键在 DFS 每一帧只有两种归宿——走完边表（后继全部已访问）或返回汇点（该帧位于通往已配对汇点的路径上）；由这二分法可证**未访问的汇点必被某个已配对源点到达**，收尾两步又保证每个落单分量都被接进环里，故加边后全图只剩一个 SCC。

- **边界**：单 SCC（含 $n=1$）输出 0；$s \ne t$ 时落单的源点与汇点由收尾两步吸收；孤立分量同时是源点和汇点，会被 `dfsFrom` 自己配上，循环移位把它的「汇点身份」挪到别的边上，因此不产生自环（代码仍保留 $u = v$ 的防御）。总时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

:::details[题解(C++)]

```c++
static int N_;
static vector<vector<int>> G_;
static vector<int> comp_;
static int C_;

static void tarjan()
{
    int n = N_;
    comp_.assign(n + 1, -1);
    vector<int> idx(n + 1, 0), low(n + 1, 0), it(n + 1, 0), stk, cs;
    vector<char> on(n + 1, 0);
    int timer = 0;
    C_ = 0;
    for (int s = 1; s <= n; s++)
    {
        if (idx[s])
            continue;
        cs.push_back(s);
        idx[s] = low[s] = ++timer;
        stk.push_back(s);
        on[s] = 1;
        it[s] = 0;
        while (!cs.empty())
        {
            int u = cs.back();
            if (it[u] < (int)G_[u].size())
            {
                int v = G_[u][it[u]++];
                if (!idx[v])
                {
                    idx[v] = low[v] = ++timer;
                    stk.push_back(v);
                    on[v] = 1;
                    it[v] = 0;
                    cs.push_back(v);
                }
                else if (on[v])
                    low[u] = min(low[u], idx[v]);
            }
            else
            {
                cs.pop_back();
                if (!cs.empty())
                {
                    int p = cs.back();
                    low[p] = min(low[p], low[u]);
                }
                if (low[u] == idx[u])
                {
                    while (true)
                    {
                        int w = stk.back();
                        stk.pop_back();
                        on[w] = 0;
                        comp_[w] = C_;
                        if (w == u)
                            break;
                    }
                    C_++;
                }
            }
        }
    }
}

static vector<pair<int, int>> buildEdges(int n, vector<vector<int>> g)
{
    N_ = n;
    G_ = g;
    tarjan();
    int c = C_;
    vector<pair<int, int>> res;
    if (c == 1)
        return res;
    vector<vector<int>> sg(c);
    vector<int> indeg(c, 0), outdeg(c, 0);
    {
        vector<pair<int, int>> es;
        for (int u = 1; u <= n; u++)
            for (int v : g[u])
                if (comp_[u] != comp_[v])
                    es.push_back({comp_[u], comp_[v]});
        sort(es.begin(), es.end());
        es.erase(unique(es.begin(), es.end()), es.end());
        for (auto &e : es)
        {
            sg[e.first].push_back(e.second);
            outdeg[e.first]++;
            indeg[e.second]++;
        }
    }
    vector<char> vis(c, 0);
    vector<pair<int, int>> edges;
    vector<int> in_unused;
    auto dfsFrom = [&](int start) -> int
    {
        vector<pair<int, int>> st;
        st.push_back({start, 0});
        while (!st.empty())
        {
            int u = st.back().first;
            if (sg[u].empty())
                return u;
            if (st.back().second < (int)sg[u].size())
            {
                int v = sg[u][st.back().second++];
                if (!vis[v])
                {
                    vis[v] = 1;
                    st.push_back({v, 0});
                }
            }
            else
                st.pop_back();
        }
        return -1;
    };
    for (int i = 0; i < c; i++)
    {
        if (indeg[i] == 0)
        {
            vis[i] = 1;
            int z = dfsFrom(i);
            if (z != -1)
                edges.push_back({z, i});
            else
                in_unused.push_back(i);
        }
    }
    for (size_t i = 1; i < edges.size(); i++)
        swap(edges[i].first, edges[i - 1].first);
    for (int i = 0; i < c; i++)
    {
        if (outdeg[i] == 0 && !vis[i])
        {
            if (!in_unused.empty())
            {
                edges.push_back({i, in_unused.back()});
                in_unused.pop_back();
            }
            else
                edges.push_back({i, c - 1});
        }
    }
    for (int u : in_unused)
        edges.push_back({0, u});
    vector<int> rep(c, -1);
    for (int u = 1; u <= n; u++)
        if (rep[comp_[u]] == -1)
            rep[comp_[u]] = u;
    for (auto &e : edges)
    {
        e.first = rep[e.first];
        e.second = rep[e.second];
    }
    return edges;
}

void solve()
{
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
    }
    auto ed = buildEdges(n, g);
    cout << ed.size() << '\n';
    for (auto [a, b] : ed)
        cout << a << ' ' << b << '\n';
}
```

:::
