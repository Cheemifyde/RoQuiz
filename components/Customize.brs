sub init()

    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h
    
    m.QuestionLabel = m.top.findNode("QuestionLabel")
    m.QuestionLabel.width = m.scrWidth 
    m.QuestionLabel.horizAlign = "center"
    m.QuestionLabel.translation = [0,100]

    m.AnswerLabel = m.top.findNode("AnswerLabel")
    m.AnswerLabel.width = m.scrWidth
    m.AnswerLabel.horizAlign = "center"
    m.AnswerLabel.translation = [0, m.scrHeight*0.5]

    m.answerGroup = m.top.findNode("AnswerButtons")
    m.answerGroup.translation = [m.scrWidth*0.4, m.scrHeight*0.5]
    m.answerGroup.size = 60
    m.answerGroup.setFocus(true)
    m.answerGroup.observeField("buttonSelected", "onButtonSelected")

    m.QuestionList = CreateObject("roList")
    m.AnswersList = CreateObject("roList")


    'Customization starts here'

    m.QuestionList.AddTail("What is the capital of France?")
    m.AnswersList.AddTail("Paris")

    m.QuestionList.AddTail("In what year was the Internet open to the public?")
    m.AnswersList.AddTail("1993")

    m.QuestionList.AddTail("What is the best selling book of all time?")
    m.AnswersList.AddTail("The Bible")

    m.choicesBank = [
        ["Paris", "London", "Berlin", "Madrid"],
        ["1990", "1991", "1992", "1993"],
        ["The Bible", "The Great Gatsby", "To Kill a Mockingbird", "The Lord of the Rings"]
    ]

    'Customization ends here'

    m.index = 0
    m.QuestionLabel.text = m.QuestionList[m.index]
    m.answerGroup.buttons = m.choicesBank[m.index]

    m.score = 0

    m.wrongaudio = createObject("roSGNode", "Audio")
    m.wrongaudioContent = createObject("RoSGNode", "ContentNode")
    m.wrongaudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongaudio.content = m.wrongaudioContent
    m.wrongaudio.control = "none"

end sub

sub onButtonSelected()

    m.answerGroup.setFocus(false)
    m.answerGroup.visible = false
    m.QuestionLabel.text = "Press OK to continue"
    m.AnswerLabel.visible = true
    selectedIndex = m.answerGroup.buttonSelected
    selectedContent = m.answerGroup.buttons[selectedIndex]

    if selectedContent = m.AnswersList[m.index]
        m.AnswerLabel.text = "Correct!"
        m.score = m.score + 1
    else
        m.AnswerLabel.text = "Incorrect! The correct answer is: " + m.AnswersList[m.index]
        m.wrongaudio.control = "play"

    end if

    m.top.setFocus(true)
    

end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false

    if press then

        if key = "OK"
            handled = true
            m.index = m.index + 1
            
            if m.index < m.QuestionList.Count()
                m.QuestionLabel.text = m.QuestionList[m.index]
                m.answerGroup.buttons = m.choicesBank[m.index]
                m.answerGroup.setFocus(true)
                m.answerGroup.visible = true
                m.AnswerLabel.visible = false
            else
                m.QuestionLabel.text = "Quiz completed!"
                m.answerGroup.visible = false
                m.AnswerLabel.text = "Your score is: " +  m.score.ToStr() + "/" + m.QuestionList.Count().ToStr()
            end if
            
        end if
    end if

    return handled

end function