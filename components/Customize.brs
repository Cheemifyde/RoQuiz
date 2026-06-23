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
    m.answerLabel.horizAlign = "center"
    m.AnswerLabel.translation = [0, m.scrHeight*0.5]

    m.answerGroup = m.top.findNode("AnswerButtons")
    m.answerGroup.minWidth = 500.0
    m.answerGroup.translation = [(m.scrWidth - m.answerGroup.minWidth)/ 2, m.scrHeight*0.3]
    m.answerGroup.setFocus(true)
    m.answerGroup.observeField("buttonSelected","onButtonSelected")

    
    m.wrongaudio = createObject("roSGNode", "Audio")
    m.wrongaudioContent = createObject("RoSGNode", "ContentNode")
    m.wrongaudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongaudio.content = m.wrongaudioContent
    m.wrongaudio.control = "none"

    m.superMaples = CreateObject("roSGNode", "Font")
    m.superMaples.uri = "pkg:/fonts/SuperMaples.ttf"
    m.superMaples.size = 37

    m.funnyTomato = CreateObject("roSGNode", "Font")
    m.funnyTomato.uri = "pkg:/fonts/FunnyTomato.ttf"
    m.funnyTomato.size = 37

    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 37

    m.gameBattles = CreateObject("roSGNode", "Font")
    m.gameBattles.uri = "pkg:/fonts/GameBattles.ttf"
    m.gameBattles.size = 23


    m.QuestionList = CreateObject("roList")
    m.AnswersList = CreateObject("roList")

    m.QuizAudio = createObject("roSGNode", "Audio")
    m.QuizAudioContent = createObject("RoSGNode", "ContentNode")
    

    'Customization starts here'

    m.QuizAudioContent.url = "https://audio.jukehost.co.uk/019ef073-e905-7097-b200-bb8d45f7d463"
    m.QuizAudio.content = m.QuizAudioContent
    m.QuizAudio.control = "play"
    m.QuizAudio.loop = true

    m.wrongaudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongaudio.content = m.wrongaudioContent

    m.QuestionList.AddTail("What is the capital of France?")
    m.AnswersList.AddTail("Paris")

    m.QuestionList.AddTail("In what year was the Internet open to the public?")
    m.AnswersList.AddTail("1993")

    m.QuestionList.AddTail("What is the best selling book of all time?")
    m.AnswersList.AddTail("The Bible")

    'to add more questions, add lines above and adjust the choicesBank accordingly'

    m.choicesBank = [
        ["Paris", "London", "Berlin", "Madrid"],
        ["1990", "1991", "1992", "1993"],
        ["The Bible", "The Great Gatsby", "To Kill a Mockingbird", "The Lord of the Rings"]
    ]

    'Remove the apostrophe on every line to change the font!
    'm.QuestionLabel.font = m.funnyTomato
    'm.AnswerLabel.font = m.sunnyStar
    'm.answerGroup.textFont = m.superMaples
    'm.answerGroup.focusedTextFont = m.gameBattles


    'Customization ends here'

    m.index = 0
    m.QuestionLabel.text = m.QuestionList[m.index]
    m.answerGroup.buttons = m.choicesBank[m.index]

    m.score = 0


end sub

sub onButtonSelected()

    m.QuestionLabel.text = "Press OK to continue"
    m.answerGroup.minWidth = 500.0
    selectedIndex = m.answerGroup.buttonSelected
    selectedContent = m.answerGroup.buttons[selectedIndex]

    if selectedContent = m.AnswersList[m.index]
        m.answerGroup.setFocus(false)
        m.answerGroup.focusFootprintBitmapUri= "pkg:/images/Correct.webp"
        m.score = m.score + 1
    
    else
        m.answerGroup.setFocus(false)
        m.wrongaudio.control = "play"
        m.answerGroup.focusFootprintBitmapUri= "pkg:/images/Incorrect.webp"

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
                m.answerGroup.minWidth = 500.0
                m.answerGroup.visible = true
                m.AnswerLabel.visible = false
            else
                m.QuestionLabel.text = "Quiz completed!"
                m.answerGroup.visible = false
                m.answerLabel.visible = true
                m.AnswerLabel.text = "Your score is: " +  m.score.ToStr() + "/" + m.QuestionList.Count().ToStr()
            end if

            
        end if
    end if

    return handled

end function