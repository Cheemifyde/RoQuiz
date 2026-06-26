sub init()

    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h

    m.background = m.top.findNode("background")
    m.background.width = m.scrWidth
    m.background.height = m.scrHeight

    m.questionLabel = m.top.findNode("questionLabel")
    m.questionLabel.width = m.scrWidth 
    m.questionLabel.horizAlign = "center"
    m.questionLabel.translation = [0,100]  
    
    m.answerLabel = m.top.findNode("answerLabel")
    m.answerLabel.width = m.scrWidth
    m.answerLabel.horizAlign = "center"
    m.answerLabel.translation = [0, m.scrHeight*0.5]

    m.answerButtonGroup = m.top.findNode("answerButtonGroup")
    m.answerButtonGroup.minWidth = 400.0
        
    m.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minWidth)/ 2, m.scrHeight*0.3]

    m.answerButtonGroup.setFocus(true)
    m.answerButtonGroup.observeField("buttonSelected","onButtonSelected")

    m.wrongAudio = createObject("roSGNode", "Audio")
    m.wrongAudioContent = createObject("RoSGNode", "ContentNode")
    m.wrongAudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongAudio.content = m.wrongAudioContent
    m.wrongAudio.control = "none"

    m.superMaples = CreateObject("roSGNode", "Font")
    m.superMaples.uri = "pkg:/fonts/SuperMaples.ttf"
    m.superMaples.size = 37

    m.bold = CreateObject("roSGNode", "Font")
    m.bold.uri = "pkg:/fonts/Bold.ttf"
    m.bold.size = 150

    m.funnyTomato = CreateObject("roSGNode", "Font")
    m.funnyTomato.uri = "pkg:/fonts/FunnyTomato.ttf"
    m.funnyTomato.size = 37

    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 37

    m.gameBattles = CreateObject("roSGNode", "Font")
    m.gameBattles.uri = "pkg:/fonts/GameBattles.ttf"
    m.gameBattles.size = 23


    m.questionList = CreateObject("roList")
    m.answersList = CreateObject("roList")

    m.quizAudio = createObject("roSGNode", "Audio")
    m.quizAudioContent = createObject("RoSGNode", "ContentNode")
    m.quizAudio.control = "play"
    m.quizAudio.loop = true
                          
    homeScene = m.top.getScene()

    'Customization starts here'

    if homeScene <> invalid 
        m.titleLabel = homeScene.findNode("title")
        if m.titleLabel <> invalid
            m.titleLabel.text = "Mentors" 'change the content within the quotes to change the title of your app
            m.titleLabel.font = m.bold 'you can change the font of the title here'
        end if
    end if

    m.background.uri = "pkg:/images/pinkGradient.png" 'change background image for the homescreen here'

    m.quizAudioContent.url = "https://audio.jukehost.co.uk/019ef073-e905-7097-b200-bb8d45f7d463"
    m.quizAudio.content = m.quizAudioContent

    m.wrongAudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongAudio.content = m.wrongAudioContent

    m.questionList.AddTail("What is the capital of France?")
    m.answersList.AddTail("Paris")

    m.questionList.AddTail("In what year was the Internet open to the public?")
    m.answersList.AddTail("1993")

    m.questionList.AddTail("What is the best selling book of all time?")
    m.answersList.AddTail("The Bible")

    'to add more questions, add lines above and adjust the choicesBank accordingly'

    m.choicesBank = [
        ["Paris", "London", "Berlin", "Madrid"],
        ["1990", "1991", "1992", "1993"],
        ["The Bible", "The Great Gatsby", "To Kill a Mockingbird", "The Lord of the Rings"]
    ]

    'Remove the apostrophe on every line to change the font!
    'm.questionLabel.font = m.funnyTomato
    'm.answerLabel.font = m.sunnyStar
    'm.answerButtonGroup.textFont = m.superMaples
    'm.answerButtonGroup.focusedTextFont = m.gameBattles


    'Customization ends here'

    m.index = 0
    m.questionLabel.text = m.questionList[m.index]
    m.answerButtonGroup.buttons = m.choicesBank[m.index]

    m.score = 0

    m.titleLabel.width = m.scrWidth 
    m.titleLabel.horizAlign = "center"

    for each button in m.answerButtonGroup.getChildren(-1, 0)
        if button.isSubtype("Button")
            button.showScrollingText = true
        end if
    end for

    if m.background.uri = "pkg:/images/customizeBackground.png"
        m.answerButtonGroup.focusBitmapUri = "pkg:/images/purpleButtons.png"
        m.answerButtonGroup.iconUri = "pkg:/images/purpleIcon.png"
        m.answerButtonGroup.focusedIconUri = "pkg:/images/purpleIcon.png"
    else if m.background.uri = "pkg:/images/blueGradient.png"
        m.answerButtonGroup.focusBitmapUri = "pkg:/images/blueButtons.png"
        m.answerButtonGroup.iconUri = "pkg:/images/blueIcon.png"
        m.answerButtonGroup.focusedIconUri = "pkg:/images/blueIcon.png"
    else if m.background.uri = "pkg:/images/pinkGradient.png"
        m.answerButtonGroup.focusBitmapUri = "pkg:/images/pinkButtons.png"
        m.answerButtonGroup.iconUri = "pkg:/images/pinkIcon.png"
        m.answerButtonGroup.focusedIconUri = "pkg:/images/pinkIcon.png"
    else if m.background.uri = "pkg:/images/orangeGradient.png"
        m.answerButtonGroup.focusBitmapUri = "pkg:/images/orangeButtons.png"
        m.answerButtonGroup.iconUri = "pkg:/images/orangeIcon.png"
        m.answerButtonGroup.focusedIconUri = "pkg:/images/orangeIcon.png"
    end if


end sub

sub onButtonSelected()

    m.questionLabel.text = "Press OK to continue"
    m.answerButtonGroup.minWidth = m.scrWidth/4
    selectedIndex = m.answerButtonGroup.buttonSelected
    selectedContent = m.answerButtonGroup.buttons[selectedIndex]

    if selectedContent = m.answersList[m.index]
        m.answerButtonGroup.setFocus(false)
        m.answerButtonGroup.focusFootprintBitmapUri= "pkg:/images/correct.png"
        m.score = m.score + 1
    
    else
        m.answerButtonGroup.setFocus(false)
        m.wrongAudio.control = "play"
        m.answerButtonGroup.focusFootprintBitmapUri= "pkg:/images/incorrect.png"

    end if

    m.top.setFocus(true)
    

end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false

    if press then

        if key = "OK"
            handled = true
            m.index = m.index + 1
            
            if m.index < m.questionList.Count()
                m.questionLabel.text = m.questionList[m.index]
                m.answerButtonGroup.buttons = m.choicesBank[m.index]
                m.answerButtonGroup.setFocus(true)
                m.answerButtonGroup.minWidth = m.scrWidth/4
                m.answerButtonGroup.visible = true
                m.answerLabel.visible = false
            else
                m.questionLabel.text = "Quiz completed!"
                m.answerButtonGroup.visible = false
                m.answerLabel.visible = true
                m.answerLabel.text = "Your score is: " +  m.score.ToStr() + "/" + m.questionList.Count().ToStr()
            end if

            
        end if
    end if

    return handled

end function