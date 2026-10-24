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

:::details[setup-dev.sh 全文]

```bash
#!/usr/bin/env bash
# ============================================================================
#  setup-dev.sh —— 全新 WSL(Ubuntu) 一键装好开发环境 + Neovim 配置
#
#  装什么：
#    apt 工具链 / Neovim 0.12 / tree-sitter CLI / Node(nvm) / Java /
#    Python venv / Chez Scheme / lua 解释器 / prettier
#    ~/.config/nvim（5 个 core + 19 个插件 + c/cpp ftplugin）
#    ~/.clang-format、~/.stylua.toml、~/.config/clangd/config.yaml
#
#  用法：
#    bash setup-dev.sh                    照默认跑全部步骤
#    bash setup-dev.sh -y                 不中途确认
#    bash setup-dev.sh --list             列出步骤名
#    bash setup-dev.sh --only core,plugins    只跑指定步骤
#    bash setup-dev.sh --skip-apt         跳过 apt
#    bash setup-dev.sh --skip-node --skip-java
#    bash setup-dev.sh --no-prefetch      不预下载插件
#    bash setup-dev.sh --no-verify        跳过最后检查
#    bash setup-dev.sh --report out.md    结果写成 Markdown
#
#  步骤：check apt path nvim treesitter node java python scheme \
#        core plugins tools lazy prefetch verify
# ============================================================================

set -Eeuo pipefail

ASSUME_YES=0; DO_PREFETCH=1; DO_VERIFY=1; REPORT=""
SKIP=(); ONLY=(); STEP=0; START_ALL=$SECONDS

NVIM_CFG="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"
LOCAL_BIN="$HOME/.local/bin"
LOCAL_OPT="$HOME/.local/opt"
NVIM="$LOCAL_BIN/nvim"
LAZY_DIR="$HOME/.local/share/nvim/lazy"
TS_VER="0.27.1"
SUDO=""
declare -a RESULTS=()

usage() { sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'; }
step_names() { printf '%s\n' check apt path nvim treesitter node java python scheme core plugins tools lazy prefetch verify; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes)      ASSUME_YES=1; shift ;;
    --skip-apt)    SKIP+=(apt); shift ;;
    --skip-node)   SKIP+=(node); shift ;;
    --skip-java)   SKIP+=(java); shift ;;
    --no-prefetch) DO_PREFETCH=0; shift ;;
    --no-verify)   DO_VERIFY=0; shift ;;
    --only)        IFS="," read -r -a ONLY <<< "$2"; shift 2 ;;
    --report)      REPORT="$2"; shift 2 ;;
    --list)        step_names; exit 0 ;;
    -h|--help)     usage; exit 0 ;;
    *) printf "未知参数：%s\n" "$1" >&2; exit 1 ;;
  esac
done

for s in ${ONLY[@]+"${ONLY[@]}"}; do
  step_names | grep -qx "$s" || { printf "未知步骤：%s（用 --list 查看）\n" "$s" >&2; exit 1; }
done

[[ $EUID -eq 0 ]] || SUDO=sudo

# ── 输出 ──
C_R='\033[31m'; C_G='\033[32m'; C_Y='\033[33m'; C_B='\033[1;36m'; C_0='\033[0m'
step() { STEP=$((STEP+1)); printf "\n${C_B}┌─ [%02d] %s${C_0}\n" "$STEP" "$*"; }
ok()   { printf "  ${C_G}✓${C_0} %s\n" "$*"; }
warn() { printf "  ${C_Y}!${C_0} %s\n" "$*" >&2; }
die()  { printf "  ${C_R}✗ %s${C_0}\n" "$*" >&2; exit 1; }
note() { printf "    %s\n" "$*"; }

record() { RESULTS+=("$1|$2|${3:-}"); }

confirm() {
  [[ $ASSUME_YES -eq 1 ]] && return 0
  local ans
  printf "  %s [y/N] " "$1"
  read -r ans
  [[ "$ans" =~ ^[Yy] ]]
}

# ── 工具函数 ──
need_cmd() { command -v "$1" >/dev/null 2>&1; }

clone_retry() {
  local name="$1" url="$2" dest="$3" branch="${4:-}" i
  local args=(--depth 1 --quiet)
  [[ -n "$branch" ]] && args+=(--branch "$branch")
  for i in 1 2 3; do
    rm -rf "$dest"
    if git clone "${args[@]}" "$url" "$dest" 2>/dev/null; then
      git -C "$dest" fetch --tags --depth 1 origin >/dev/null 2>&1 || true
      return 0
    fi
    warn "$name 第 $i 次失败，3 秒后重试"
    sleep 3
  done
  return 1
}

write_file() {
  local path="$1" bak
  mkdir -p "$(dirname "$path")"
  if [[ -e "$path" ]]; then
    bak="$path.bak.$(date +%Y%m%d-%H%M%S)"
    cp -a "$path" "$bak"
    note "备份 $(basename "$path")"
  fi
  cat > "$path"
}

should_run() {
  local name="$1" s
  for s in ${SKIP[@]+"${SKIP[@]}"}; do [[ "$s" == "$name" ]] && return 1; done
  [[ ${#ONLY[@]} -eq 0 ]] && return 0
  for s in ${ONLY[@]+"${ONLY[@]}"}; do [[ "$s" == "$name" ]] && return 0; done
  return 1
}

run_step() {
  local name="$1" fn="$2" t0=$SECONDS rc=0 dur
  if ! should_run "$name"; then
    note "跳过 $name（--only/--skip）"
    record skip "$name" "按参数跳过"
    return 0
  fi
  step "$name"
  ( set -e; "$fn" ) || rc=$?
  dur=$((SECONDS - t0))
  if [[ $rc -eq 0 ]]; then record ok "$name" "${dur}s"; else record fail "$name" "见上方输出（${dur}s）"; fi
  return 0
}

# ═══ 步骤实现 ═══════════════════════════════════════════════════════════════

do_check() {
  [[ -f /etc/os-release ]] || die "不是 Linux"
  . /etc/os-release
  ok "系统：$PRETTY_NAME"
  if grep -qi microsoft /proc/version 2>/dev/null; then ok "运行在 WSL"; fi
  need_cmd git  || die "缺 git"
  need_cmd curl || die "缺 curl"
  ok "git $(git --version | awk '{print $3}')"

  # sudo 预热：输一次密码，后面 apt 不再问
  if [[ -n "$SUDO" ]]; then
    if ! sudo -n true 2>/dev/null; then
      note "apt 需要 sudo 权限，请输一次密码（后面不会再问）"
      sudo -v || die "sudo 授权失败"
    fi
    ok "sudo 已授权"
  else
    ok "当前是 root"
  fi
  [[ $DO_PREFETCH -eq 1 ]] || note "提示：--no-prefetch 已开，插件交给 lazy 自己下"
}

do_apt() {
  local PKGS=(build-essential clang clangd clang-format cmake gdb
              git curl wget unzip tar ripgrep fd-find wl-clipboard
              python3 python3-venv python3-pip chezscheme lua5.4)
  if should_run java; then PKGS+=(default-jdk); fi
  note "将安装：${PKGS[*]}"
  confirm "开始 apt 安装？" || { warn "跳过 apt"; return 0; }
  $SUDO apt update -y
  $SUDO env DEBIAN_FRONTEND=noninteractive apt install -y "${PKGS[@]}"
  ok "apt 安装完成"

  # fd-find 装出来叫 fdfind，补一个 fd
  if need_cmd fdfind && ! need_cmd fd; then
    ln -sfn "$(command -v fdfind)" "$LOCAL_BIN/fd"; ok "fd -> fdfind"
  fi
  # lua5.4 装出来叫 lua5.4，run.lua 里用的是 lua
  if need_cmd lua5.4 && ! need_cmd lua; then
    ln -sfn "$(command -v lua5.4)" "$LOCAL_BIN/lua"; ok "lua -> lua5.4"
  fi
}

do_path() {
  mkdir -p "$LOCAL_BIN"
  case ":$PATH:" in *":$LOCAL_BIN:"*) ;; *) export PATH="$LOCAL_BIN:$PATH" ;; esac
  if grep -q "setup-dev.sh PATH" "$HOME/.bashrc" 2>/dev/null; then
    ok "~/.bashrc 已有 PATH 配置"
    return 0
  fi
  cat >> "$HOME/.bashrc" <<'RC'

# >>> setup-dev.sh PATH >>>
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac
# <<< setup-dev.sh PATH <<<
RC
  ok "已写入 ~/.bashrc"
}

do_nvim() {
  if [[ -x "$NVIM" ]]; then
    local cur; cur=$("$NVIM" --version | head -n1 | awk '{print $2}')
    case "$cur" in
      v0.12.*|v0.13.*|v0.14.*) ok "已装 $cur"; return 0 ;;
      *) warn "现有 $cur 太旧，重装" ;;
    esac
  fi
  mkdir -p "$LOCAL_BIN" "$LOCAL_OPT"
  local tb=/tmp/nvim-linux-x86_64.tar.gz
  note "下载 Neovim stable（约 12MB）"
  curl -fL --retry 3 --retry-delay 3 --connect-timeout 20 --progress-bar \
    -o "$tb" https://github.com/neovim/neovim/releases/download/stable/nvim-linux-x86_64.tar.gz
  rm -rf "$LOCAL_OPT/nvim-linux-x86_64"
  tar -xzf "$tb" -C "$LOCAL_OPT"
  ln -sfn "$LOCAL_OPT/nvim-linux-x86_64/bin/nvim" "$NVIM"
  rm -f "$tb"
  ok "$("$NVIM" --version | head -n1)"
}

do_treesitter() {
  local v
  if need_cmd tree-sitter; then
    v=$(tree-sitter --version 2>/dev/null | awk '{print $2}')
    if [[ -n "${v:-}" ]] && [[ "$(printf '%s\n%s\n' "0.26.1" "$v" | sort -V | head -n1)" == "0.26.1" ]]; then
      ok "tree-sitter $v 可用"; return 0
    fi
    warn "现有 ${v:-未知} 太旧（apt 里是 0.25.x，编译不了 main 分支的解析器）"
  fi
  note "下载 tree-sitter ${TS_VER} 预编译二进制"
  curl -fL --retry 3 --connect-timeout 20 --progress-bar -o /tmp/ts.gz \
    "https://github.com/tree-sitter/tree-sitter/releases/download/v${TS_VER}/tree-sitter-linux-x64.gz"
  gzip -t /tmp/ts.gz || die "压缩包损坏（网络问题，重跑本步）"
  gunzip -f /tmp/ts.gz
  install -m 755 /tmp/ts "$LOCAL_BIN/tree-sitter"
  rm -f /tmp/ts
  ok "tree-sitter $("$LOCAL_BIN/tree-sitter" --version)"
}

do_node() {
  export NVM_DIR="$HOME/.nvm"
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    note "安装 nvm"
    curl -fsSL -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  set +u; . "$NVM_DIR/nvm.sh"; set -u
  if ! need_cmd node; then nvm install --lts >/dev/null || die "node 安装失败"; fi
  ok "node $(node -v) / npm $(npm -v)"
  if ! need_cmd prettier; then
    note "安装 prettier（conform 格式化 JS/TS 要用）"
    npm i -g prettier --no-fund --no-audit >/dev/null 2>&1 || warn "prettier 安装失败"
  fi
  if need_cmd prettier; then ok "prettier $(prettier --version)"; else warn "prettier 缺失，JS/TS 格式化会静默失效"; fi
}

do_java() {
  need_cmd java  && ok "java $(java -version 2>&1 | head -n1)" || warn "java 缺失，重跑 apt 步骤"
  need_cmd javac && ok "javac 可用" || warn "javac 缺失（run.lua 的 java 分支需要）"
}

do_python() {
  ok "python3 $(python3 -V 2>&1 | awk '{print $2}')"
  python3 -c "import venv" 2>/dev/null && ok "venv 可用" || warn "venv 不可用"
}

do_scheme() {
  if need_cmd chezscheme; then ok "chezscheme 可用（命令是 chezscheme / petite，没有 scheme）"
  else warn "chezscheme 缺失（apt 包名 chezscheme）"; fi
}

# ── core 配置（init + 4 个 core + 2 个 ftplugin）──
do_core() {
  mkdir -p "$NVIM_CFG/lua/core" "$NVIM_CFG/lua/plugins" "$NVIM_CFG/after/ftplugin"

  write_file "$NVIM_CFG/init.lua" <<'LUA_EOF'
vim.g.mapleader = " "
vim.g.maplocalleader = ","

-- Mason 的服务器在 data/mason/bin，treesitter 的解析器在 data/site
vim.env.PATH = table.concat({
  vim.fn.stdpath("data") .. "/mason/bin",
  vim.fn.stdpath("data") .. "/site/bin",
  vim.env.PATH,
}, ":")

require("core.options")
require("core.keymaps")
require("core.run")
require("core.lazy")
LUA_EOF

  write_file "$NVIM_CFG/lua/core/options.lua" <<'LUA_EOF'
local opt = vim.opt

-- 显示
opt.number = true
opt.relativenumber = true
opt.cursorline = true
opt.signcolumn = "yes"
opt.termguicolors = true
opt.wrap = false
opt.scrolloff = 6
opt.pumheight = 10

-- 缩进（C/C++ 在 after/ftplugin 里改用 cindent）
opt.expandtab = true
opt.shiftwidth = 4
opt.tabstop = 4
opt.softtabstop = 4
opt.smartindent = true
opt.shiftround = true

-- 搜索
opt.ignorecase = true
opt.smartcase = true

-- 窗口
opt.splitright = true
opt.splitbelow = true

-- 文件
opt.undofile = true
opt.autoread = true
opt.swapfile = false          -- 否则 neo-tree 打开文件会报 E325
opt.confirm = true
opt.clipboard = "unnamedplus" -- 需要 wl-clipboard

-- 操作
opt.mouse = "a"
opt.updatetime = 250
opt.timeoutlen = 400
opt.whichwrap = "b,s,<,>,[,]"

-- 补全手感（0.12+）
if vim.fn.has("nvim-0.12") == 1 then
  opt.completeopt = "menu,menuone,noselect,noinsert,nearest"
  opt.winborder = "rounded"
  opt.pumborder = "rounded"
end

vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function() vim.highlight.on_yank({ timeout = 200 }) end,
})

vim.g.loaded_node_provider = 0
vim.g.loaded_perl_provider = 0
vim.g.loaded_python3_provider = 0
vim.g.loaded_ruby_provider = 0
LUA_EOF
  write_file "$NVIM_CFG/lua/core/keymaps.lua" <<'LUA_EOF'
local map = vim.keymap.set

map("n", "<Esc>", "<cmd>nohlsearch<CR>", { desc = "清除搜索高亮" })
map("n", "<leader>w", "<cmd>write<CR>", { desc = "保存" })
map("n", "<leader>q", "<cmd>quit<CR>", { desc = "退出窗口" })
map("n", "<leader>r", function() require("core.run").run() end, { desc = "运行当前文件" })
map("t", "<Esc>", "<C-\\><C-n>", { desc = "退出终端模式" })

-- 窗口切换用原生 Ctrl+w h/j/k/l：避免占用 <leader>w 前缀（会让保存等 400ms）
map("n", "<leader>sv", "<cmd>vsplit<CR>", { desc = "竖分屏" })
map("n", "<leader>sh", "<cmd>split<CR>", { desc = "横分屏" })

vim.api.nvim_create_autocmd("LspAttach", {
  callback = function(ev)
    local function b(l, r, d) vim.keymap.set("n", l, r, { buffer = ev.buf, desc = d }) end
    b("gd", vim.lsp.buf.definition, "跳转定义")
    b("gr", vim.lsp.buf.references, "查找引用")
    b("K", vim.lsp.buf.hover, "悬停文档")
    b("<leader>cr", vim.lsp.buf.rename, "重命名")   -- 用 cr，不占用 <leader>r
    b("<leader>ca", vim.lsp.buf.code_action, "代码操作")
    b("<leader>d", vim.diagnostic.open_float, "当前行诊断")
  end,
})
LUA_EOF

  write_file "$NVIM_CFG/lua/core/lazy.lua" <<'LUA_EOF'
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  local out = vim.fn.system({
    "git", "clone", "--filter=blob:none", "--branch=stable",
    "https://github.com/folke/lazy.nvim.git", lazypath,
  })
  if vim.v.shell_error ~= 0 then error("安装 lazy.nvim 失败：" .. out) end
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup("plugins", {
  checker = { enabled = false },
  change_detection = { notify = false },
  git = { timeout = 900 },     -- 默认 120 秒，网络慢时 clone 会被杀掉
})
LUA_EOF

  write_file "$NVIM_CFG/lua/core/run.lua" <<'LUA_EOF'
local M = {}
local term_buf = nil

local function save()
  if vim.bo.modified then vim.cmd("silent! write") end
end

local function cache_dir()
  local d = vim.fn.stdpath("cache") .. "/run"
  vim.fn.mkdir(d, "p")
  return d
end

function M.plan()
  local file = vim.fn.expand("%:p")
  if file == "" then return nil, "当前缓冲区还没有文件名，先保存一下" end
  local ft = vim.bo.filetype
  local base = vim.fn.fnamemodify(file, ":t:r")
  local F = vim.fn.shellescape(file)
  local O = vim.fn.shellescape(cache_dir() .. "/" .. base)
  local C = vim.fn.shellescape(cache_dir())

  local t = {
    scheme     = "chezscheme --script " .. F,
    lua        = "lua " .. F,
    python     = "python3 " .. F,
    javascript = "node " .. F,
    sh         = "bash " .. F,
    c          = "cc -std=c17 -O2 -Wall " .. F .. " -o " .. O .. " && " .. O,
    cpp        = "g++ -std=c++20 -O2 -Wall " .. F .. " -o " .. O .. " && " .. O,
    java       = "javac -d " .. C .. " " .. F .. " && java -cp " .. C .. " " .. base,
  }
  return t[ft]
end

function M.run()
  save()
  local cmd, err = M.plan()
  if err then vim.notify(err, vim.log.levels.WARN) return end
  if not cmd then vim.notify("没有为 filetype=" .. vim.bo.filetype .. " 配置运行命令", vim.log.levels.WARN) return end
  if term_buf and vim.api.nvim_buf_is_valid(term_buf) then
    pcall(vim.api.nvim_buf_delete, term_buf, { force = true })
  end
  local cwd = vim.fn.fnamemodify(vim.fn.expand("%:p"), ":h")
  vim.cmd("botright 12split")
  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_win_set_buf(0, buf)
  vim.fn.termopen({ "bash", "-lc", cmd }, { cwd = cwd })
  vim.cmd("startinsert")
  term_buf = buf
end

return M
LUA_EOF

  write_file "$NVIM_CFG/after/ftplugin/c.lua" <<'LUA_EOF'
-- 只对 .c 生效：cindent 处理 case/public/续行 比 smartindent 准
local o = vim.opt_local
o.cindent = true
o.smartindent = false
o.shiftwidth = 4
o.tabstop = 4
o.softtabstop = 4
o.expandtab = true
LUA_EOF

  write_file "$NVIM_CFG/after/ftplugin/cpp.lua" <<'LUA_EOF'
-- 只对 .cpp 生效：cindent 处理 case/public/续行 比 smartindent 准
local o = vim.opt_local
o.cindent = true
o.smartindent = false
o.shiftwidth = 4
o.tabstop = 4
o.softtabstop = 4
o.expandtab = true
LUA_EOF

  ok "core：init + options + keymaps + lazy + run + 2 个 ftplugin"
}

do_plugins() {

  write_file "$NVIM_CFG/lua/plugins/colorscheme.lua" <<'LUA_EOF'
return {
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    opts = { style = "night" },
    config = function(_, opts)
      require("tokyonight").setup(opts)
      vim.cmd.colorscheme("tokyonight")   -- setup 只存配置，这行才真正应用
    end,
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/treesitter.lua" <<'LUA_EOF'
return {
  {
    "nvim-treesitter/nvim-treesitter",
    lazy = false,
    build = ":TSUpdate",
    config = function()
      require("nvim-treesitter").setup({
        install_dir = vim.fn.stdpath("data") .. "/site",
      })
      pcall(require("nvim-treesitter").install, {
        "c", "cpp", "lua", "vim", "vimdoc", "query",
        "markdown", "markdown_inline",
        "javascript", "typescript", "tsx", "json",
        "python", "java", "bash", "yaml", "toml", "scheme",
      })
      vim.api.nvim_create_autocmd("FileType", {
        callback = function() pcall(vim.treesitter.start) end,
      })
    end,
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/mason.lua" <<'LUA_EOF'
return {
  {
    "mason-org/mason.nvim",
    build = ":MasonUpdate",
    cmd = "Mason",
    keys = { { "<leader>cm", "<cmd>Mason<CR>", desc = "打开 Mason" } },
    opts = {},
  },
  {
    "mason-org/mason-lspconfig.nvim",
    dependencies = { "mason-org/mason.nvim", "neovim/nvim-lspconfig" },
    opts = {
      ensure_installed = { "lua_ls", "ts_ls", "stylua", "ruff" },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/lsp.lua" <<'LUA_EOF'
return {
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPre", "BufNewFile" },
    config = function()
      local servers = {
        { name = "lua_ls", exe = "lua-language-server" },
        { name = "clangd", exe = "clangd" },
        { name = "ts_ls", exe = "typescript-language-server" },
        { name = "jdtls", exe = "jdtls", extra = { vim.fn.stdpath("data") .. "/mason/bin/jdtls" } },
      }

      local function resolve(spec)
        local found = vim.fn.exepath(spec.exe)
        if found ~= "" then return found end
        for _, c in ipairs(spec.extra or {}) do
          if vim.fn.executable(c) == 1 then return c end
        end
      end

      vim.lsp.config("lua_ls", {
        settings = {
          Lua = {
            runtime = { version = "LuaJIT" },
            workspace = { checkThirdParty = false },
            telemetry = { enable = false },
          },
        },
      })
      -- query-driver：让 clangd 去问 g++ 系统头文件在哪
      vim.lsp.config("clangd", {
        cmd = { "clangd", "--background-index", "--query-driver=/usr/bin/g++" },
      })

      local enabled = {}
      for _, spec in ipairs(servers) do
        local exe = resolve(spec)
        if exe then
          if spec.name == "jdtls" then vim.lsp.config("jdtls", { cmd = { exe } }) end
          enabled[#enabled + 1] = spec.name
        end
      end
      vim.lsp.enable(enabled)      -- 没有这行，服务器装了也不会启用
    end,
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/completion.lua" <<'LUA_EOF'
return {
  {
    "saghen/blink.cmp",
    branch = "v1",                 -- main 是 v2，要额外装 blink.lib；v1 才是无依赖的稳定线
    event = { "InsertEnter" },
    dependencies = { "rafamadriz/friendly-snippets" },
    opts = {
      keymap = { preset = "super-tab" },
      appearance = { nerd_font_variant = "mono" },
      completion = {
        documentation = { auto_show = true },
      },
      sources = { default = { "lsp", "path", "snippets", "buffer" } },
      fuzzy = { implementation = "prefer_rust" },   -- 预编译二进制下不到时静默降级到 Lua
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/neotree.lua" <<'LUA_EOF'
return {
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    dependencies = { "nvim-lua/plenary.nvim", "nvim-tree/nvim-web-devicons", "MunifTanjim/nui.nvim" },
    cmd = "Neotree",
    keys = { { "<leader>e", "<cmd>Neotree toggle<CR>", desc = "文件树" } },
    opts = {
      filesystem = {
        filtered_items = { visible = false, hide_dotfiles = false, hide_gitignored = false },
      },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/lualine.lua" <<'LUA_EOF'
-- 状态栏 + navic 面包屑（navic 自己不画界面，靠这里显示）
return {
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    dependencies = { "nvim-tree/nvim-web-devicons", "SmiteshP/nvim-navic" },
    opts = {
      options = { theme = "auto", globalstatus = true },
      sections = {
        lualine_c = {
          { "filename", path = 1 },
          {
            function() return require("nvim-navic").get_location() end,
            cond = function() return pcall(function() return require("nvim-navic").is_available() end) end,
          },
        },
      },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/minipairs.lua" <<'LUA_EOF'
return {
  { "echasnovski/mini.pairs", version = "*", event = "InsertEnter", opts = {} },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/conform.lua" <<'LUA_EOF'
return {
  {
    "stevearc/conform.nvim",
    keys = {
      {
        "<leader>cf",
        function()
          require("conform").format({ async = true, lsp_format = "fallback" })
        end,
        desc = "格式化当前文件",
      },
    },
    opts = {
      formatters = {
        -- stylua 只读「当前目录」的配置，不认 ~ 下的，所以显式指过去
        stylua = { prepend_args = { "--config-path", vim.fn.expand("~/.stylua.toml") } },
      },
      formatters_by_ft = {
        lua = { "stylua" },
        c = { "clang_format" },
        cpp = { "clang_format" },
        python = { "ruff_format" },
        javascript = { "prettier" },
        typescript = { "prettier" },
      },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/rainbow.lua" <<'LUA_EOF'
return {
  {
    "HiPhish/rainbow-delimiters.nvim",
    dependencies = { "nvim-treesitter/nvim-treesitter" },
    event = { "BufReadPost", "BufNewFile" },
    config = function()
      pcall(function() require("rainbow-delimiters.setup").setup({}) end)
    end,
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/snacks.lua" <<'LUA_EOF'
-- 一个插件顶五个：picker / notifier / input / indent / words / terminal
return {
  {
    "folke/snacks.nvim",
    priority = 1000,
    lazy = false,
    opts = {
      bigfile   = { enabled = true },
      input     = { enabled = true },
      notifier  = { enabled = true },
      picker    = { enabled = true },
      indent    = { enabled = true },
      words     = { enabled = true },
      terminal  = { enabled = true },
      dashboard = { enabled = false },
      explorer  = { enabled = false },  -- 用 neo-tree
      scroll    = { enabled = false },  -- WSL 下会卡
    },
    keys = {
      { "<leader>ff", function() Snacks.picker.files() end,       desc = "搜文件" },
      { "<leader>fg", function() Snacks.picker.grep() end,        desc = "搜内容" },
      { "<leader>fb", function() Snacks.picker.buffers() end,     desc = "缓冲区" },
      { "<leader>fr", function() Snacks.picker.recent() end,      desc = "最近打开" },
      { "<leader>fd", function() Snacks.picker.diagnostics() end, desc = "诊断列表" },
      { "<leader>fh", function() Snacks.picker.help() end,        desc = "帮助文档" },
      { "<leader>sn", function() Snacks.notifier.show_history() end, desc = "通知历史" },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/better-escape.lua" <<'LUA_EOF'
-- 插入模式连打 jk 回普通模式
return { { "max397574/better-escape.nvim", event = "InsertEnter", opts = {} } }
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/which-key.lua" <<'LUA_EOF'
-- 按空格停半秒，列出所有可用键位
return {
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    opts = { preset = "helix" },   -- 若报错说 preset 无效，改成 opts = {}
    keys = {
      { "<leader>?", function() require("which-key").show({ global = false }) end, desc = "本文件键位" },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/surround.lua" <<'LUA_EOF'
-- ysw" 加引号 / cs"' 换引号 / ds" 删引号
return { { "kylechui/nvim-surround", event = "VeryLazy", opts = {} } }
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/flash.lua" <<'LUA_EOF'
-- s 跳转（覆盖了原生 s，用 cl 代替）；S 按语法节点选（原生 S 可用 cc 代替）
return {
  {
    "folke/flash.nvim",
    event = "VeryLazy",
    opts = {},
    keys = {
      { "s", mode = { "n", "x", "o" }, function() require("flash").jump() end, desc = "Flash 跳转" },
      { "S", mode = { "n", "x", "o" }, function() require("flash").treesitter() end, desc = "Flash 选中节点" },
    },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/hlslens.lua" <<'LUA_EOF'
-- 搜索时显示「第几个/共几个」，命中带跳转标签
return {
  {
    "kevinhwang91/nvim-hlslens",
    event = { "BufReadPost", "BufNewFile" },
    config = function()
      require("hlslens").setup()
      local kopts = { noremap = true, silent = true }
      vim.keymap.set("n", "n", [[<Cmd>execute('normal! ' . v:count1 . 'n')<CR><Cmd>lua require('hlslens').start()<CR>]], kopts)
      vim.keymap.set("n", "N", [[<Cmd>execute('normal! ' . v:count1 . 'N')<CR><Cmd>lua require('hlslens').start()<CR>]], kopts)
      vim.keymap.set("n", "*", [[*<Cmd>lua require('hlslens').start()<CR>]], kopts)
      vim.keymap.set("n", "#", [[#<Cmd>lua require('hlslens').start()<CR>]], kopts)
    end,
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/gitsigns.lua" <<'LUA_EOF'
-- 行号旁 Git 改动 + 行尾 blame
return {
  {
    "lewis6991/gitsigns.nvim",
    event = { "BufReadPre", "BufNewFile" },
    opts = { current_line_blame = true },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/navic.lua" <<'LUA_EOF'
-- 面包屑：自己不画界面，由 lualine 显示
return {
  {
    "SmiteshP/nvim-navic",
    event = "LspAttach",
    opts = { highlight = true, separator = " > ", depth_limit = 5, lsp = { auto_attach = true } },
  },
}
LUA_EOF

  write_file "$NVIM_CFG/lua/plugins/fidget.lua" <<'LUA_EOF'
-- 右下角显示 LSP 索引进度（位置由插件硬编码在右下角，不可调）
return { { "j-hui/fidget.nvim", event = "LspAttach", opts = {} } }
LUA_EOF

  ok "19 个插件文件写完"
}

do_tools() {
  write_file "$HOME/.clang-format" <<'YAML_EOF'
BasedOnStyle: LLVM
IndentWidth: 4
TabWidth: 4
UseTab: Never
ColumnLimit: 120
BreakBeforeBraces: Attach
AllowShortFunctionsOnASingleLine: Empty
YAML_EOF

  write_file "$HOME/.stylua.toml" <<'TOML_EOF'
column_width = 120
line_endings = "Unix"
indent_type = "Spaces"
indent_width = 4
quote_style = "AutoPreferDouble"
call_parentheses = "Always"
TOML_EOF

  write_file "$HOME/.config/clangd/config.yaml" <<'YAML_EOF'
# ── 补全行为 ──
Completion:
  # 只插入名字，不自动塞模板参数/函数参数（None = 和 VS Code 一致）
  ArgumentLists: None
  # 不自动在文件顶部加 #include（默认 IWYU 会在接受补全时插入）
  HeaderInsertion: Never

# ── C/C++ 标准 ──
# 不写 -std 的时候 clangd 按 gnu++17 解析，concepts / <=> / 缩写模板全报错
If:
  PathMatch: .*\.(h|cpp|cc|cxx|hpp|hh|hxx|cppm|ixx)$
CompileFlags:
  Add: [-std=c++20]
YAML_EOF

  ok "~/.clang-format、~/.stylua.toml、~/.config/clangd/config.yaml 已写入"
}

do_lazy() {
  mkdir -p "$LAZY_DIR"
  if [[ -d "$LAZY_DIR/lazy.nvim" ]]; then ok "lazy.nvim 已存在"; return 0; fi
  if clone_retry "lazy.nvim" "https://github.com/folke/lazy.nvim.git" "$LAZY_DIR/lazy.nvim" stable; then
    ok "lazy.nvim 就位（stable）"
  else
    warn "lazy.nvim 下载失败，首次启动 nvim 时会再试"
  fi
}

do_prefetch() {
  if [[ $DO_PREFETCH -eq 0 ]]; then warn "按参数跳过预下载"; return 0; fi
  local LIST=(
    "tokyonight.nvim|folke/tokyonight.nvim"
    "nvim-treesitter|nvim-treesitter/nvim-treesitter"
    "plenary.nvim|nvim-lua/plenary.nvim"
    "nvim-web-devicons|nvim-tree/nvim-web-devicons"
    "nui.nvim|MunifTanjim/nui.nvim"
    "neo-tree.nvim|nvim-neo-tree/neo-tree.nvim"
    "mason.nvim|mason-org/mason.nvim"
    "mason-lspconfig.nvim|mason-org/mason-lspconfig.nvim"
    "nvim-lspconfig|neovim/nvim-lspconfig"
    "blink.cmp|saghen/blink.cmp|v1"
    "friendly-snippets|rafamadriz/friendly-snippets"
    "lualine.nvim|nvim-lualine/lualine.nvim"
    "mini.pairs|echasnovski/mini.pairs"
    "conform.nvim|stevearc/conform.nvim"
    "rainbow-delimiters.nvim|HiPhish/rainbow-delimiters.nvim"
    "snacks.nvim|folke/snacks.nvim"
    "better-escape.nvim|max397574/better-escape.nvim"
    "which-key.nvim|folke/which-key.nvim"
    "nvim-surround|kylechui/nvim-surround"
    "flash.nvim|folke/flash.nvim"
    "nvim-hlslens|kevinhwang91/nvim-hlslens"
    "gitsigns.nvim|lewis6991/gitsigns.nvim"
    "nvim-navic|SmiteshP/nvim-navic"
    "fidget.nvim|j-hui/fidget.nvim"
  )
  local FAILED=() total=${#LIST[@]} cur=0 item name rest repo br
  for item in "${LIST[@]}"; do
    cur=$((cur + 1))
    name="${item%%|*}"; rest="${item#*|}"; repo="${rest%%|*}"; br=""
    case "$rest" in *"|"*) br="${rest##*|}" ;; esac
    if [[ -d "$LAZY_DIR/$name/.git" ]]; then
      printf "    [%02d/%02d] %-24s 已有\n" "$cur" "$total" "$name"
      continue
    fi
    printf "    [%02d/%02d] %-24s 下载中\n" "$cur" "$total" "$name"
    if clone_retry "$name" "https://github.com/$repo.git" "$LAZY_DIR/$name" "$br"; then
      printf "              ok\n"
    else
      printf "              失败\n"
      FAILED+=("$name")
    fi
  done
  if [[ ${#FAILED[@]} -eq 0 ]]; then
    ok "全部 $total 个插件已下载"
  else
    warn "以下插件没下成功（启动 nvim 时 lazy 会再试）："
    note "${FAILED[*]}"
  fi
}

do_verify() {
  if [[ $DO_VERIFY -eq 0 ]]; then warn "按参数跳过检查"; return 0; fi
  if [[ ! -x "$NVIM" ]]; then warn "找不到 $NVIM，跳过校验（先跑 nvim 步骤）"; return 0; fi
  local bad=0 f out
  while IFS= read -r -d "" f; do
    out=$("$NVIM" --headless -c "lua local fn,err=loadfile('$f'); print(fn and 'OK' or ('ERR '..tostring(err)))" -c qa 2>&1 | tail -n1)
    if [[ "$out" != "OK" ]]; then
      warn "语法错误：$f"
      note "$out"
      bad=$((bad + 1))
    fi
  done < <(find "$NVIM_CFG" -name "*.lua" -print0)
  if [[ $bad -eq 0 ]]; then ok "所有 Lua 文件语法正确"; else warn "$bad 个文件有问题"; fi

  note "试启动一次（最多 120 秒）"
  if timeout 120 "$NVIM" --headless -u "$NVIM_CFG/init.lua" +qa >/tmp/nvim-first-start.log 2>&1; then
    ok "启动正常"
  else
    warn "启动有问题，日志见 /tmp/nvim-first-start.log"
    tail -n 12 /tmp/nvim-first-start.log
  fi
}

do_summary() {
  local okn=0 skipn=0 failn=0 line st name nt total
  echo
  echo "══ 汇总 ══════════════════════════════════════════════"
  for line in "${RESULTS[@]}"; do
    st="${line%%|*}"; line="${line#*|}"; name="${line%%|*}"; nt="${line#*|}"
    if [[ "$st" == "ok" ]]; then
      okn=$((okn + 1))
      printf "  ${C_G}✓${C_0} %-12s %s\n" "$name" "$nt"
    elif [[ "$st" == "skip" ]]; then
      skipn=$((skipn + 1))
      printf "  ${C_Y}-${C_0} %-12s %s\n" "$name" "$nt"
    else
      failn=$((failn + 1))
      printf "  ${C_R}✗${C_0} %-12s %s\n" "$name" "$nt"
    fi
  done
  total=$((SECONDS - START_ALL))

  printf '\n  成功 %d / 跳过 %d / 失败 %d    总耗时 %dm%02ds\n' \
    "$okn" "$skipn" "$failn" "$((total / 60))" "$((total % 60))"

  if [[ -n "$REPORT" ]]; then
    echo '# setup-dev 安装记录' > "$REPORT"
    echo "" >> "$REPORT"
    echo "| 步骤 | 结果 | 备注 |" >> "$REPORT"
    echo "| --- | --- | --- |" >> "$REPORT"
    for line in "${RESULTS[@]}"; do
      st="${line%%|*}"; line="${line#*|}"; name="${line%%|*}"; nt="${line#*|}"
      case "$st" in
        ok)   m="成功" ;;
        skip) m="跳过" ;;
        *)    m="失败" ;;
      esac
      printf '| %s | %s | %s |\n' "$name" "$m" "$nt" >> "$REPORT"
    done
    printf "\n总耗时 %dm%02ds\n" "$((total / 60))" "$((total % 60))" >> "$REPORT"
    ok "报告已写入 $REPORT"
  fi
}

do_next_steps() {
  cat <<'TIP'

  接下来：

  1) 开一个新终端（或 source ~/.bashrc），让 ~/.local/bin 进 PATH
       nvim --version | head -n1      # v0.12.x
       tree-sitter --version          # 0.27.1
       chezscheme --version           # Chez Scheme（没有 scheme 这个命令）

  2) 正常打开 nvim（不要 --headless）
     · 第一次会编译 treesitter 解析器，右下角有进度，等 1-2 分钟别退出
     · :Mason 里按 i 装语言服务器（lua_ls / ts_ls 等）
     · 验证 LSP：:lua print(vim.inspect(vim.tbl_map(function(c) return c.name end, vim.lsp.get_clients())))

  3) 常用键
       空格 w 保存    空格 q 退窗口    空格 r 运行     空格 e 文件树
       空格 f f 搜文件  空格 f g 搜内容  空格 ? 看键位   空格 c m Mason
       空格 c f 格式化  空格 c r 重命名  gd 跳定义     jk 回普通模式

  4) 出问题先看：:messages  :Lazy  :checkhealth

  彻底重来：rm -rf ~/.config/nvim ~/.local/share/nvim ~/.local/state/nvim
TIP
}

# ═══ 调度 ═══════════════════════════════════════════════════════════════════
run_step check do_check
run_step apt do_apt
run_step path do_path
run_step nvim do_nvim
run_step treesitter do_treesitter
run_step node do_node
run_step java do_java
run_step python do_python
run_step scheme do_scheme
run_step core do_core
run_step plugins do_plugins
run_step tools do_tools
run_step lazy do_lazy
run_step prefetch do_prefetch
run_step verify do_verify

do_summary
do_next_steps
```

:::
