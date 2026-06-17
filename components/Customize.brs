sub init()

    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h
    
    m.QuestionLabel = m.top.findNode("QuestionLabel")
    m.QuestionLabel.width = m.scrWidth 
    m.QuestionLabel.horizAlign = "center"

    m.answerGroup = m.top.findNode("AnswerButtons")
    m.answerGroup.translation = [m.scrWidth*0.4, m.scrHeight*0.5]
    m.answerGroup.size = 60
    m.answerGroup.buttons = ["A", "B", "C", "D"]
    m.answerGroup.setFocus(true)
    m.answerGroup.observeField("buttonSelected", "onButtonSelected")
end sub

sub onButtonSelected()

m.answerGroup.setFocus(false)
m.answerGroup.visible = false
m.QuestionLabel.visible = false

end sub