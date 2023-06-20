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
                </div>
                <div class="buttonContainer">
                    <div class="startButton" @click="control(true)">
                        开始做题
                    </div>
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
                        <div :class="{ 'questionOptionContainer': currentQuestion.optionsFlag[index] == 0, 'questionOptionTrueContainer': currentQuestion.optionsFlag[index] == 1, 'questionOptionFalseContainer': currentQuestion.optionsFlag[index] == -1 }"
                            v-for="(item, index) in  currentQuestion.options " @click="judge(index)" v-if="optionsRefresh">
                            <span class="questionOptionId">{{ String.fromCharCode('A'.charCodeAt(0) + index) }}</span>
                            <span class="questionOptionItem">{{ item }}</span>
                        </div>
                    </div>
                    <div class="questionButtonContainer">
                        <div class="questionButton" @click="checkFlag ? getRandomQuestion() : judge(-1)">
                            {{ checkFlag ? '下一题' : '不会' }}
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
            data: [],

            controlling: false,

            currentQuestion: {},
            optionsRefresh: true,
            checkFlag: false,
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
                this.data = []
                console.log(table)
                for (var i = 2; i <= row; i++) {
                    var obj = {}
                    obj.type = table['A' + i].v
                    obj.stem = table['B' + i].v
                    obj.correct = table['C' + i].v
                    obj.optionNum = table['D' + i].v
                    obj.options = []
                    for (var j = 1; j <= obj.optionNum; j++) {
                        obj.options.push(table[String.fromCharCode('D'.charCodeAt(0) + j) + i].v)
                    }
                    this.data.push(obj)
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
            this.currentQuestion = this.data[Math.floor(Math.random() * this.data.length)]
            this.currentQuestion.optionsFlag = Array(this.currentQuestion.optionNum).fill(0)
            this.checkFlag = false
        },
        judge(index) {
            if (this.checkFlag == false) {
                if (this.currentQuestion.correct.charCodeAt(0) - 'A'.charCodeAt(0) != index && index != -1) {
                    this.currentQuestion.optionsFlag[index] = -1
                }
                this.currentQuestion.optionsFlag[this.currentQuestion.correct.charCodeAt(0) - 'A'.charCodeAt(0)] = 1
                this.optionsRefresh = false
                this.optionsRefresh = true
                this.checkFlag = true
            }
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
    width: 160px;
    height: calc(100% - 60px);
    padding: 30px 20px 30px 20px;
    border-radius: 30px;
    position: absolute;
}

.uploadContainer {
    padding: 10px 5px 10px 5px;
}

.uploadButton {
    width: 75%;
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
    width: 75%;
    height: 30px;
    padding: 5px 0px 5px 0px;
    border-radius: 20px;
    background-color: rgb(221, 180, 128);
    display: inline-block;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
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
    padding: 5px;
    border-radius: 20px;
    display: inline-block;
    font-size: 20px;
    background-color: rgb(255, 209, 122);
    cursor: pointer;
}
</style>