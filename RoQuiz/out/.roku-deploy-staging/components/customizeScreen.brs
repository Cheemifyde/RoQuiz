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
    m.answerLabel.font.size = 60

    m.tryAgainLabel = m.top.findNode("tryAgainLabel")
    m.tryAgainLabel.width = m.scrWidth
    m.tryAgainLabel.horizAlign = "center"
    m.tryAgainLabel.translation = [0, m.scrHeight*0.62]
    m.tryAgainLabel.scaleRotateCenter = [m.scrWidth*0.5, 30]

    m.answerButtonGroup = m.top.findNode("answerButtonGroup")
    m.answerButtonGroup.translation = [100,100]
    m.answerButtonGroup.minWidth = 400.0
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
                          
    homeScene = m.top.getScene()

    m.QuizImage = m.top.findNode("QuizPic")
    m.QuizImage.width = m.scrWidth * 0.42
    m.QuizImage.height = m.scrHeight * 0.52

    m.confetti1 = m.top.findNode("confetti1")
    m.confetti2 = m.top.findNode("confetti2")
    m.confettiAnimation = m.top.findNode("confettiAnimation")
    m.tryAgainBounce = m.top.findNode("tryAgainBounce")

    m.quizComplete = false



    'Customization starts here'

    'Label colors - change the hex colors here to customize the app text
    m.questionLabel.color = "#000000" 'question text color
    m.answerLabel.color = "#FFFFFF" 'final score text color
    m.tryAgainLabel.color = "#FF0000" '"Try Again!" text color

    'Answer button text colors
    m.answerButtonGroup.textColor = "#FFFFFF" 'unfocused answer text color
    m.answerButtonGroup.focusedTextColor = "#000000" 'focused answer text color

    if homeScene <> invalid 
        m.titleLabel = homeScene.findNode("title")
        if m.titleLabel <> invalid
            m.titleLabel.text = "Customize" 'change the content within the quotes to change the title of your app
            m.titleLabel.font = m.bold 'you can change the font of the title here'
            m.titleLabel.color = "#FFFFFF" 'home title text color
        end if
    end if


    'Right aligned button group
    'm.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minWidth) * 0.825, m.scrHeight*0.3]

    'Left aligned button group
    m.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minWidth) * 0.17, m.scrHeight*0.33]  

    m.background.uri = "pkg:/images/customizeBackground.png" 'change background image for the homescreen here'

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

    m.questionList.AddTail("Who wrote Romeo and Juliet?")
    m.answersList.AddTail("William Shakespeare")

    m.questionList.AddTail("Who wrote the Harry Potter books?")
    m.answersList.AddTail("J.K. Rowling")

    'to add more questions, add lines above and adjust the choicesBank accordingly'

    m.choicesBank = [
        ["Paris", "London", "Berlin", "Madrid"],
        ["1990", "1991", "1992", "1993"],
        ["The Bible", "The Great Gatsby", "To Kill a Mockingbird", "The Lord of the Rings"],
        ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
        ["J.R.R. Tolkien", "J.K. Rowling", "Roald Dahl", "Suzanne Collins"]
    ]

    m.QuizImageList = [
        "pkg:/images/France.webp",
        "pkg:/images/Internet.webp",
        "pkg:/images/Books.jpg",
        "pkg:/images/RomeoandJuliet.jpg",
        "pkg:/images/HarryPotter.webp"
    ]

    'Left aligned image - goes with right aligned button group
    'm.QuizImage.translation = [100, m.scrHeight*0.36]

    'Right aligned image - goes with left aligned button group
    m.QuizImage.translation = [m.scrWidth*0.5, m.scrHeight*0.33]

    'Remove the apostrophe on every line to change the font!
    'm.questionLabel.font = m.funnyTomato
    'm.answerLabel.font = m.sunnyStar
    'm.answerButtonGroup.textFont = m.superMaples
    'm.answerButtonGroup.focusedTextFont = m.gameBattles


    'Customization ends here'

    m.index = 0
    m.questionLabel.text = m.questionList[m.index]
    m.answerButtonGroup.buttons = m.choicesBank[m.index]
    m.QuizImage.uri = m.QuizImageList[m.index]

    m.score = 0

    m.titleLabel.width = m.scrWidth 
    m.titleLabel.horizAlign = "center"

    for each button in m.answerButtonGroup.getChildren(-1, 0)
        if button.isSubtype("Button")
            button.showScrollingText = true
        end if
    end for

    if m.background.uri = "pkg:/images/customizeBackground.png"
        m.answerButtonGroup.focusBitmapUri = "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/purpleButtons.png"
    else if m.background.uri = "pkg:/images/blueGradient.png"
        m.answerButtonGroup.focusBitmapUri = "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/blueButtons.png"
    else if m.background.uri = "pkg:/images/pinkGradient.png"
        m.answerButtonGroup.focusBitmapUri = "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/pinkButtons.png"
    else if m.background.uri = "pkg:/images/orangeGradient.png"
        m.answerButtonGroup.focusBitmapUri = "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/orangeButtons.png"
    end if

    m.quizAudio.control = "play"
    m.quizAudio.loop = true


end sub

sub keepSelectedAnswerBlack(selectedIndex as Integer)
    selectedButton = m.answerButtonGroup.getChild(selectedIndex)
    if selectedButton <> invalid
        selectedButton.textColor = "#000000"
        selectedButton.focusedTextColor = "#000000"
    end if
end sub

sub stopQuizAudio()
    m.quizAudio.control = "stop"
    m.wrongAudio.control = "stop"
end sub

sub onButtonSelected()

    m.questionLabel.text = "Press OK to continue"
    selectedIndex = m.answerButtonGroup.buttonSelected
    selectedContent = m.answerButtonGroup.buttons[selectedIndex]
    keepSelectedAnswerBlack(selectedIndex)

    if selectedContent = m.answersList[m.index]
        m.answerButtonGroup.setFocus(false)
        m.answerButtonGroup.focusFootprintBitmapUri= "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/correct.png"
        m.score = m.score + 1
    
    else
        m.answerButtonGroup.setFocus(false)
        m.wrongAudio.control = "play"
        m.answerButtonGroup.focusFootprintBitmapUri= "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/incorrect.png"

    end if

    m.top.setFocus(true)
    

end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false

    if press then

        if key = "OK"
            m.index = m.index + 1

            if m.quizComplete = true
                return handled
            end if
            
            if m.index < m.questionList.Count()
                handled = true
                m.questionLabel.text = m.questionList[m.index]
                m.answerButtonGroup.buttons = m.choicesBank[m.index]
                m.QuizImage.uri = m.QuizImageList[m.index]
                m.answerButtonGroup.setFocus(true)
                m.answerButtonGroup.visible = true
                m.answerLabel.visible = false
            else
                m.questionLabel.text = "Quiz completed!"
                m.QuizImage.visible = false
                m.answerButtonGroup.visible = false
                m.answerLabel.visible = true
                m.answerLabel.text = "Your score is: " +  m.score.ToStr() + "/" + m.questionList.Count().ToStr()
                if (m.score * 2) < m.questionList.Count()
                    m.tryAgainLabel.visible = true
                    m.tryAgainBounce.control = "start"
                else
                    m.confetti1.visible = true
                    m.confetti2.visible = true
                    m.confettiAnimation.control = "start"
                end if
                m.quizComplete = true
            end if

            
        end if
    end if

    return handled

end function
