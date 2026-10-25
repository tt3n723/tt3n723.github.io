---
title: "新的开始"
description: "2022 年 5 月 4 日，我产生了建立了个人博客的想法"
pubDate: 2025-05-04T21:00:00+08:00
tags: []
categories: []
cover: "/img/begin.jpg"
---
2022 年 5 月 4 日，我产生了建立了个人博客的想法，希望能记录一点东西，多年以后回想起来，不会觉得虚度光阴，这几年来，博客断断续续也更新了许多，但是由于我的完美主义，认为之前写的东西不算很好，于是几乎全部删掉重写，说实话，有些后悔，虽然还有一些痕迹，但总觉得自己的一部分消失了，再也找不回了。

这几年也经历了许多事情，碌碌无为，一事无成，而且我还是浑浑噩噩，没有找到一个事物来消耗我的所有热情，总是渴望活在别人的生活里，借此逃离自己的生活。每天都会浪费很多时间在无意义的人与事，找不到活着的意义。

人生是用来体验的，不是用来演绎完美的。我也没有什么伟大的理想，只想做我喜欢的事，把时间分给对这个世界的热爱，以及永远铭记生活的美好。所以请好好努力，哪怕一个人，也要寂寞又精彩。希望通过这个博客，留下一些有意义，值得回顾的东西。

下面是两份代码，一个是算法竞赛的初始化模板，一个是 WSL 环境安装脚本

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
void _dbg(const T &x) {
    if constexpr (requires { x.first, x.second; })
        cerr << "(", _dbg(x.first), cerr << ", ", _dbg(x.second), cerr << ")";
    else if constexpr (requires { x.begin(), x.end(); } &&
                       !is_same_v<T, string>) {
        bool f = 1;
        constexpr bool m = requires { typename T::mapped_type; };
        cerr << (m ? "{" : "[");
        for (auto &&e : x)
            if constexpr (m)
                cerr << SEP << e.first << ": ", _dbg(e.second);
            else
                cerr << SEP, _dbg(e);
        cerr << (m ? "}" : "]");
    } else
        cerr << x;
}
template <class... T>
void _p(const T &...x) {
    bool f = 1;
    ((cerr << SEP, _dbg(x)), ...);
    cerr << "\n";
}
#define dbg(...) (cerr << #__VA_ARGS__ << " = ", _p(__VA_ARGS__))

class Solution {
  public:
    void solve() {
        
    }
};

signed main() {
    //ios::sync_with_stdio(false), cin.tie(nullptr);
    int T = 1;
    // cin >> T;
    while (T--) {
        Solution sol;
        sol.solve();
    }
    return 0;
}
```

:::details[]

```bash
#!/usr/bin/env bash
# 全新 WSL(Ubuntu)：装开发环境 + LazyVim。一条命令，不需要任何参数。
#   bash setup-lazyvim.sh
set -euo pipefail

# 先要一次密码，之后 apt 不再打断
sudo -v

echo "==> 1/6 系统包"
sudo apt update
sudo env DEBIAN_FRONTEND=noninteractive apt install -y \
  build-essential clang clangd clang-format cmake gdb \
  git curl wget unzip tar ripgrep fd-find wl-clipboard \
  python3 python3-venv python3-pip chezscheme lua5.4 default-jdk

echo "==> 2/6 Neovim + tree-sitter"
mkdir -p ~/.local/bin ~/.local/opt
curl -fL -o /tmp/nvim.tar.gz https://github.com/neovim/neovim/releases/download/stable/nvim-linux-x86_64.tar.gz
rm -rf ~/.local/opt/nvim-linux-x86_64
tar -xzf /tmp/nvim.tar.gz -C ~/.local/opt
ln -sfn ~/.local/opt/nvim-linux-x86_64/bin/nvim ~/.local/bin/nvim

curl -fL -o /tmp/ts.gz https://github.com/tree-sitter/tree-sitter/releases/download/v0.27.1/tree-sitter-linux-x64.gz
gunzip -f /tmp/ts.gz
install -m 755 /tmp/ts ~/.local/bin/tree-sitter
rm -f /tmp/nvim.tar.gz /tmp/ts

# fd-find / lua5.4 装出来的命令名和常用的不一样，补两个软链
ln -sfn "$(command -v fdfind)" ~/.local/bin/fd
ln -sfn "$(command -v lua5.4)" ~/.local/bin/lua

# ~/.local/bin 加进 PATH
grep -q 'setup-lazyvim PATH' ~/.bashrc || cat >> ~/.bashrc <<'RC'

# >>> setup-lazyvim PATH >>>
export PATH="$HOME/.local/bin:$PATH"
# <<< setup-lazyvim PATH <<<
RC
export PATH="$HOME/.local/bin:$PATH"

echo "==> 3/6 clangd 配置"
mkdir -p ~/.config/clangd
cat > ~/.config/clangd/config.yaml <<'EOF'
Completion:
  ArgumentLists: None      # 补全只插名字，不带模板参数
  HeaderInsertion: Never   # 不自动加 #include
If:
  PathMatch: .*\.(h|cpp|cc|cxx|hpp|hh|hxx|cppm|ixx)$
CompileFlags:
  Add: [-std=c++20]        # 不写这行 clangd 按 gnu++17 解析，C++20 全报错
EOF

echo "==> 4/6 LazyVim"
mv ~/.config/nvim ~/.config/nvim.bak.$(date +%s) 2>/dev/null || true
git clone https://github.com/LazyVim/starter ~/.config/nvim
rm -rf ~/.config/nvim/.git

# lazy.nvim 默认 120 秒就杀掉 git 进程，网络慢会一直失败
sed -i 's|^require("lazy").setup({|require("lazy").setup({\n  git = { timeout = 900 },|' ~/.config/nvim/lua/config/lazy.lua
grep -q "timeout = 900" ~/.config/nvim/lua/config/lazy.lua \
  || echo "警告：git.timeout 补丁没打上（starter 改写法了），不影响使用"

# jk 退出插入模式（LazyVim 默认只有 Esc）
cat >> ~/.config/nvim/lua/config/keymaps.lua <<'EOF'

vim.keymap.set("i", "jk", "<Esc>")
EOF

# 缩进 4 空格（LazyVim 默认 2）；关掉交换文件，否则文件树打开会报 E325
cat >> ~/.config/nvim/lua/config/options.lua <<'EOF'

vim.opt.shiftwidth = 4
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.swapfile = false
EOF

# C/C++：用 apt 装的 clangd，补 cpp/scheme 解析器，配 clang-format
cat > ~/.config/nvim/lua/plugins/cpp.lua <<'EOF'
return {
  { "neovim/nvim-lspconfig",
    opts = { servers = { clangd = {
      mason = false,   -- 用 apt 装的，别让 mason 再下一份
      cmd = { "clangd", "--background-index", "--query-driver=/usr/bin/g++" },
    } } } },
  { "nvim-treesitter/nvim-treesitter",
    opts = { ensure_installed = { "cpp", "scheme" } } },
  { "stevearc/conform.nvim",
    opts = { formatters_by_ft = {
      c = { "clang_format" }, cpp = { "clang_format" },
      python = { "ruff_format" },
      javascript = { "prettier" }, typescript = { "prettier" },
    } } },
}
EOF

# 空格 r 运行当前文件（LazyVim 不带这个）
cat > ~/.config/nvim/lua/plugins/run.lua <<'EOF'
local function cmd_for(file)
  local base = vim.fn.fnamemodify(file, ":t:r")
  local out = vim.fn.shellescape(vim.fn.stdpath("cache") .. "/run/" .. base)
  local F = vim.fn.shellescape(file)
  vim.fn.mkdir(vim.fn.stdpath("cache") .. "/run", "p")
  return ({
    scheme     = "chezscheme --script " .. F,
    lua        = "lua " .. F,
    python     = "python3 " .. F,
    javascript = "node " .. F,
    sh         = "bash " .. F,
    c          = "cc -std=c17 -O2 -Wall " .. F .. " -o " .. out .. " && " .. out,
    cpp        = "g++ -std=c++20 -O2 -Wall " .. F .. " -o " .. out .. " && " .. out,
    java       = "javac -d " .. vim.fn.shellescape(vim.fn.stdpath("cache") .. "/run") .. " " .. F,
  })[vim.bo.filetype]
end

return {
  { "folke/snacks.nvim",
    keys = {
      { "<leader>r",
        function()
          local file = vim.fn.expand("%:p")
          if file == "" then vim.notify("先保存文件", vim.log.levels.WARN) return end
          local cmd = cmd_for(file)
          if not cmd then vim.notify("没有为 " .. vim.bo.filetype .. " 配置运行命令", vim.log.levels.WARN) return end
          vim.cmd("write")
          vim.cmd("botright 12split")
          vim.api.nvim_win_set_buf(0, vim.api.nvim_create_buf(false, true))
          vim.fn.jobstart({ "bash", "-lc", cmd }, { term = true, cwd = vim.fn.fnamemodify(file, ":h") })
          vim.cmd("startinsert")
        end,
        desc = "运行当前文件" },
    } },
}
EOF

echo "==> 5/6 Node + prettier"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] || curl -fsSL -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
set +u; . "$NVM_DIR/nvm.sh"; set -u
nvm install --lts || echo "node 装失败，跳过（不影响 Neovim）"
npm i -g prettier

echo "==> 6/6 检查"
for c in nvim tree-sitter rg fd wl-copy lua clangd clang-format chezscheme javac node prettier; do
  printf "  %-13s %s\n" "$c" "$(command -v "$c" || echo "缺")"
done

echo ""
echo "装完了。接下来："
echo "  1) 直接 nvim，第一次会下载 30 多个插件，等几分钟"
echo "  2) 进 nvim 后敲 :TSUpdate ，等解析器装完（不装就没有语法高亮）"
echo "  3) :Mason 里按 i 装语言服务器（lua_ls / ts_ls）"
```

:::
