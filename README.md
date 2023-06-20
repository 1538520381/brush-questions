# brush-questions
## 一、版本号
1.0

## 二、功能说明
用户可以自行上传并练习想要刷的题目集

## 三、使用方式
1. 在该项目路径下打开命令行
2. 在命令行中依次输入下列指令
```
npm install
npm run serve
```
3. 浏览器打开网址 http://localhost:8080/
4. 将想刷的题集按照源代码中 src/data/questions.xlsx 的xlsx中的格式做成xlsx表
5. 点击网址中“文件上传”按钮上传题集xlsx表
6. 点击开始做题

## 四、注意事项
1. 该版本目前仅支持单选题与判断题
2. 上传的xlsx表请按src/data/question.xlsx中的格式，且请不要留有空行