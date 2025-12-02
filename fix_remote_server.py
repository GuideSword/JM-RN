#!/usr/bin/env python3
"""
自动修复远程服务器上的 JM-NcatBot
使用 paramiko 连接服务器并执行修复命令
"""

import paramiko
import sys

# 服务器信息
HOST = "101.37.28.116"
USER = "root"
PASSWORD = "huangjianpei123@"
PORT = 22

def execute_command(ssh, command, description):
    """执行命令并显示输出"""
    print(f"\n{'='*60}")
    print(f"执行: {description}")
    print(f"命令: {command}")
    print(f"{'='*60}")
    
    stdin, stdout, stderr = ssh.exec_command(command)
    
    # 读取输出
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    
    if output:
        print(output)
    if error:
        print(f"错误: {error}", file=sys.stderr)
    
    return output, error

def main():
    print("正在连接服务器...")
    
    try:
        # 创建 SSH 客户端
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # 连接服务器
        ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=10)
        print("连接成功！\n")
        
        # 进入项目目录
        execute_command(ssh, "cd ~/JM-NcatBot && pwd", "进入项目目录")
        
        # 1. 备份文件
        execute_command(ssh, "cd ~/JM-NcatBot && cp main.py main.py.bak", "备份 main.py")
        
        # 2. 查看当前代码
        execute_command(ssh, "cd ~/JM-NcatBot && head -30 main.py", "查看当前 main.py 的前30行")
        
        # 3. 修复导入语句
        execute_command(ssh, 
            "cd ~/JM-NcatBot && sed -i 's/from ncatbot.utils.config import config/from ncatbot.utils.config import Config/g' main.py",
            "修复导入语句（config -> Config）")
        
        # 4. 检查 config 的使用
        execute_command(ssh, 
            "cd ~/JM-NcatBot && grep -n 'config\\.' main.py || echo '未发现 config. 的使用'",
            "检查 config 的使用情况")
        
        # 5. 查看修复后的代码
        execute_command(ssh, 
            "cd ~/JM-NcatBot && head -30 main.py",
            "查看修复后的代码")
        
        # 6. 检查是否需要创建实例
        # 如果代码中使用 config.xxx，需要在导入后添加 config = Config()
        output, _ = execute_command(ssh,
            "cd ~/JM-NcatBot && grep -n 'config\\.' main.py | head -5",
            "检查是否需要创建 config 实例")
        
        if output.strip() and "未发现" not in output:
            print("\n⚠️  发现 config. 的使用，需要创建实例")
            print("请在 main.py 的导入语句后添加: config = Config()")
            
            # 尝试自动添加
            execute_command(ssh,
                """cd ~/JM-NcatBot && python3 << 'PYEOF'
import re

with open('main.py', 'r') as f:
    content = f.read()

# 检查是否已经有 config = Config()
if 'config = Config()' not in content:
    # 在导入 Config 后添加实例化
    content = re.sub(
        r'(from ncatbot\.utils\.config import Config)',
        r'\\1\nconfig = Config()',
        content,
        count=1
    )
    
    with open('main.py', 'w') as f:
        f.write(content)
    print('已自动添加 config = Config()')
else:
    print('config = Config() 已存在')
PYEOF""",
                "自动添加 config 实例化")
        
        # 7. 测试导入
        execute_command(ssh,
            "cd ~/JM-NcatBot && ./venv/bin/python3 -c \"from ncatbot.utils.config import Config; config = Config(); print('✅ 导入和实例化成功')\"",
            "测试导入和实例化")
        
        # 8. 尝试运行（可能会因为其他配置问题失败，但至少可以看到导入是否成功）
        print("\n" + "="*60)
        print("尝试运行程序（可能会因为配置问题而失败，但可以验证导入）")
        print("="*60)
        stdin, stdout, stderr = ssh.exec_command("cd ~/JM-NcatBot && timeout 5 ./venv/bin/python3 main.py 2>&1 | head -20")
        
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        if output:
            print(output)
        if error:
            print(f"错误输出: {error}")
        
        print("\n" + "="*60)
        print("修复完成！")
        print("="*60)
        print("\n如果还有问题，请检查：")
        print("1. 配置文件是否存在（config.yml）")
        print("2. 其他依赖是否已安装")
        print("3. 运行: cd ~/JM-NcatBot && ./venv/bin/python3 main.py")
        
        ssh.close()
        
    except paramiko.AuthenticationException:
        print("❌ 认证失败，请检查用户名和密码")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ SSH 连接错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        import paramiko
    except ImportError:
        print("❌ 需要安装 paramiko: pip install paramiko")
        sys.exit(1)
    
    main()


