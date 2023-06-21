<template>
    <div id="index">
        <div class="container">
            <div class="fileContainer">
                <div class="uploadContainer">
                    <label class="uploadButton" for="upload">文件上传</label>
                    <input type="file" id="upload" @change="uploadFile($event)" style="display: none;">
                    <div class="fileNameSpan">
                        {{ fileName == '' || fileName == null || fileName == undefined ? '未上传文件' : fileName }}
                    </div>
                    <div class="uploadButton" @click="downloadFile()">错题下载</div>
                </div>
                <hr>
                <div class="buttonContainer">
                    <div class="startButton" @click="control(true)">
                        开始做题
                    </div>
                </div>
                <hr>
                <div class="patternVontainer">
                    <div class="patternTitle">
                        模式选择
                    </div>
                    <el-form ref="form" :model="pattern" label-width="150px">
                        <el-form-item label="选项顺序是否打乱">
                            <el-switch v-model="pattern.randomOption" active-color="#13ce66"
                                inactive-color="#ff4949"></el-switch>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="questionContainer" ref="questionContainer">
                <div v-if="controlling">
                    <div class="returnFileContainerButton" @click="control(false)">
                        <svg-icon icon-class="exit" class="returnFileContainerButtonIcon"></svg-icon>
                    </div>
                    <div class="questionTypeContainer">
                        {{ currentQuestion.type }}
                    </div>
                    <div class="questionStemContainer">
                        {{ currentQuestion.stem }}
                    </div>
                    <div class="questionOptionsContainer">
                        <div :class="{ 'questionOptionContainer': currentQuestion.options[index].optionFlag == 0, 'questionOptionTrueContainer': currentQuestion.options[index].optionFlag == 1, 'questionOptionFalseContainer': currentQuestion.options[index].optionFlag == 2, 'questionOptionChoiceContainer': currentQuestion.options[index].optionFlag == 3 }"
                            v-for="(item, index) in  currentQuestion.options "
                            @click="currentQuestion.type == '多选题' ? choice(index) : judge(index)" v-if="optionsRefresh">
                            <span class="questionOptionId">{{ String.fromCharCode('A'.charCodeAt(0) + index) }}</span>
                            <span class="questionOptionItem">{{ item.option }}</span>
                        </div>
                    </div>
                    <div class="questionButtonContainer">
                        <div class="questionButton" @click="checkFlag ? getRandomQuestion() : judge(-1)">
                            {{ checkFlag ? '下一题' : '不会' }}
                        </div>
                        <div class="questionButton" @click="judge(-1)"
                            v-if="currentQuestion.type == '多选题' && checkFlag == false">
                            确定
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as XLSX from 'xlsx'
export default {
    name: 'index',
    data() {
        return {
            file: null,
            fileName: '',
            questions: [],
            wrongQuestions: [],

            controlling: false,

            currentQuestion: {},
            optionsRefresh: true,
            checkFlag: false,

            pattern: {
                randomOption: false,
            },

            obj: [
                {
                    id: 1,
                    name: 2,
                    score: 3
                },
                {
                    id: 2,
                    name: 3,
                    score: 4
                },
                {
                    id: 3,
                    name: 4,
                    score: 5
                }
            ]
        }
    },
    created() {
    },
    methods: {
        uploadFile(event) {
            this.file = event.target.files[0]
            this.fileName = this.file.name
            const reader = new FileReader()
            reader.readAsBinaryString(this.file)
            reader.onload = re => {
                const data = re.target.result
                const zzexcel = XLSX.read(data, {
                    type: 'binary'
                })
                var table = zzexcel.Sheets[Object.keys(zzexcel.Sheets)[0]]
                var index = table['!ref'].indexOf(':')
                var row = table['!ref'].substring(index + 2)
                this.questions = []
                this.wrongQuestions = []
                for (var i = 2; i <= row; i++) {
                    var obj = {}
                    obj.id = i - 2
                    obj.type = table['A' + i].v
                    obj.stem = table['B' + i].v
                    obj.correct = table['C' + i].v
                    obj.optionNum = table['D' + i].v
                    obj.options = []
                    for (var j = 1; j <= obj.optionNum; j++) {
                        obj.options.push(table[String.fromCharCode('D'.charCodeAt(0) + j) + i].v)
                    }
                    this.questions.push(obj)
                }
                this.$message.success('文件上传成功')
            }
        },
        control(flag) {
            var obj = this.$refs.questionContainer
            var _this = this
            if (flag) {
                if (this.file == null) {
                    this.$message.error('请先上传文件')
                } else {
                    var timestamp = 0
                    this.getRandomQuestion()
                    var clock = setInterval(function () {
                        timestamp += 1
                        obj.style.width = timestamp + '%'
                        if (timestamp == 96) {
                            clearInterval(clock)
                            _this.controlling = true
                        }
                    })
                }
            } else {
                var timestamp = 96
                this.controlling = false
                var clock = setInterval(function () {
                    timestamp -= 1
                    obj.style.width = timestamp + '%'
                    if (timestamp == 0) {
                        clearInterval(clock)
                    }
                })
            }
        },
        getRandomQuestion() {
            this.currentQuestion = Object.assign({}, this.questions[Math.floor(Math.random() * this.questions.length)])
            var options = this.currentQuestion.options
            this.currentQuestion.options = []
            options.forEach(item => {
                var option = {}
                option.option = item
                option.optionFlag = 0
                this.currentQuestion.options.push(option)
            });
            for (var i = 0; i < this.currentQuestion.correct.length; i++) {
                this.currentQuestion.options[this.currentQuestion.correct.charAt(i).charCodeAt(0) - 'A'.charCodeAt(0)].optionTrueFlag = 1
            }
            if (this.pattern.randomOption) {
                this.currentQuestion.options.sort(function () {
                    return (0.5 - Math.random())
                })
            }
            this.checkFlag = false
        },
        judge(index) {
            switch (this.currentQuestion.type) {
                case '单选题':
                    this.judge1(index)
                    break
                case '判断题':
                    this.judge2(index)
                    break
                case '多选题':
                    this.judge3()
                    break
                default:
                    this.$message.error(this.currentQuestion.type + '暂不支持')
            }
        },
        judge1(index) {
            if (this.checkFlag == false) {
                var flag = false
                if (index != -1 && this.currentQuestion.options[index].optionTrueFlag != 1) {
                    this.currentQuestion.options[index].optionFlag = 2
                    flag = true
                }
                if (flag) {
                    flag = false
                    for (var i = 0; i < this.wrongQuestions.length; i++) {
                        if (this.wrongQuestions[i].id == this.currentQuestion.id) {
                            flag = true
                        }
                    }
                    if (flag == false) {
                        this.wrongQuestions.push(this.questions[this.currentQuestion.id])
                    }
                }
                this.currentQuestion.options.forEach(item => {
                    if (item.optionTrueFlag == 1) {
                        item.optionFlag = 1
                    }
                })
                this.refresh()
                this.checkFlag = true
            }
        },
        judge2(index) {
            if (this.checkFlag == false) {
                var flag = false
                if (index != -1 && this.currentQuestion.options[index].optionTrueFlag != 1) {
                    this.currentQuestion.options[index].optionFlag = 2
                    flag = true
                }
                if (flag) {
                    flag = false
                    for (var i = 0; i < this.wrongQuestions.length; i++) {
                        if (this.wrongQuestions[i].id == this.currentQuestion.id) {
                            flag = true
                        }
                    }
                    if (flag == false) {
                        this.wrongQuestions.push(this.questions[this.currentQuestion.id])
                    }
                }
                this.currentQuestion.options.forEach(item => {
                    if (item.optionTrueFlag == 1) {
                        item.optionFlag = 1
                    }
                })
                this.refresh()
                this.checkFlag = true
            }
        },
        judge3() {
            if (this.checkFlag == false) {
                var flag = false
                this.currentQuestion.options.forEach(item => {
                    if (index != -1 && item.optionFlag == 3 && item.optionTrueFlag == 0) {
                        item.optionFlag = 2
                        flag = true
                    }
                    if (item.optionTrueFlag == 1) {
                        if (item.optionFlag == 0) {
                            flag = true
                        }
                        item.optionFlag = 1
                    }
                })
                if (flag) {
                    flag = false
                    for (var i = 0; i < this.wrongQuestions.length; i++) {
                        if (this.wrongQuestions[i].id == this.currentQuestion.id) {
                            flag = true
                        }
                    }
                    if (flag == false) {
                        this.wrongQuestions.push(this.questions[this.currentQuestion.id])
                    }
                }
                this.refresh()
                this.checkFlag = true
            }
        },
        choice(index) {
            this.currentQuestion.options[index].optionFlag = this.currentQuestion.options[index].optionFlag == 0 ? 3 : 0
            this.refresh()
        },
        refresh() {
            this.optionsRefresh = false
            this.optionsRefresh = true
        },
        downloadFile() {
            var wrongQuestions = []
            this.wrongQuestions.forEach(item => {
                var wrongQuestion = {}
                wrongQuestion['题型'] = item.type
                wrongQuestion['题干'] = item.stem
                wrongQuestion['正确答案'] = item.correct
                wrongQuestion['选项数'] = item.optionNum
                for (var i = 0; i < item.options.length; i++) {
                    wrongQuestion[String.fromCharCode('A'.charCodeAt(0) + i)] = item.options[i]
                }
                wrongQuestions.push(wrongQuestion)
            })
            var ws = XLSX.utils.json_to_sheet(wrongQuestions)
            var wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "错题集")
            XLSX.writeFile(wb, "错题集.xlsx")
        }
    }
}
</script>

<style scoped>
#index {
    width: 70%;
    height: calc(100% - 120px);
    padding: 60px 15% 60px 15%;
    background-color: rgb(245, 228, 206);
}

.container {
    width: 100%;
    height: 100%;
    border-radius: 30px;
    position: relative;
    background-color: rgb(233, 205, 168);
}

.fileContainer {
    width: 220px;
    height: calc(100% - 60px);
    padding: 30px 20px 30px 20px;
    border-radius: 30px;
    position: absolute;
}

.uploadContainer {
    padding: 10px 5px 10px 5px;
}

.uploadButton {
    width: 125px;
    height: 30px;
    padding: 5px 0px 5px 0px;
    border-radius: 20px;
    background-color: rgb(221, 180, 128);
    display: inline-block;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
}

.fileNameSpan {
    padding: 10px;
}

.buttonContainer {
    padding: 10px 5px 10px 5px;
}

.startButton {
    width: 125px;
    height: 30px;
    padding: 5px 0px 5px 0px;
    border-radius: 20px;
    background-color: rgb(221, 180, 128);
    display: inline-block;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
}

.patternVontainer {
    padding: 10px 5px 10px 5px;
}

.patternTitle {
    font-size: 20px;
}

.questionContainer {
    width: 0%;
    height: calc(100% - 40px);
    border-radius: 30px;
    padding: 20px 2% 20px 2%;
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 0;
    background-color: rgb(221, 180, 128);
}

.returnFileContainerButton {
    cursor: pointer;
}

.returnFileContainerButtonIcon {
    width: 30px;
    height: 30px;
    padding-right: 10px;
    float: right;
}

.questionTypeContainer {
    padding: 10px;
    font-size: 25px;
}

.questionStemContainer {
    padding: 20px 10% 0px 10%;
    font-size: 20px;
}

.questionOptionsContainer {
    width: 80%;
    padding: 20px 10% 20px 10%;
    cursor: pointer;
}

.questionOptionContainer {
    width: calc(100% - 40px);
    margin: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 20px;
    background-color: rgb(216, 161, 88);
}

.questionOptionContainer:hover {
    width: calc(100% - 40px);
    margin: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 20px;
    background-color: rgb(211, 183, 146);
}

.questionOptionTrueContainer {
    width: calc(100% - 40px);
    margin: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 20px;
    background-color: rgb(94, 213, 80);
}

.questionOptionFalseContainer {
    width: calc(100% - 40px);
    margin: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 20px;
    background-color: rgb(209, 56, 39);
}

.questionOptionChoiceContainer {
    width: calc(100% - 40px);
    margin: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 20px;
    background-color: rgb(20, 196, 219);
}

.questionOptionId {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    display: inline-block;
    text-align: center;
    background-color: rgb(239, 212, 151);
}

.questionOptionItem {
    padding: 8px;
}

.questionButtonContainer {
    width: 100%;
    text-align: center;
}

.questionButton {
    width: 100px;
    height: 30px;
    margin: 5px;
    padding: 5px;
    border-radius: 20px;
    display: inline-block;
    font-size: 20px;
    background-color: rgb(255, 209, 122);
    cursor: pointer;
}
</style>