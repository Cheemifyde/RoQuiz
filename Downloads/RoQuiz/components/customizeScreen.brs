sub init()

    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h

    m.background = m.top.findNode("background")
    m.background.width = m.scrWidth
    m.background.height = m.scrHeight

    m.questionLabel = m.top.findNode("questionLabel")
    m.questionLabel.width = m.scrWidth * 0.57
    m.questionLabel.height = m.scrHeight * 0.13
    m.questionLabel.horizAlign = "center"
    m.questionLabel.vertAlign = "center"
    m.questionLabel.maxLines = 2
    m.questionLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.087]

    m.continueLabel = m.top.findNode("continueLabel")
    m.continueLabel.width = m.scrWidth * 0.57
    m.continueLabel.height = m.scrHeight * 0.06
    m.continueLabel.horizAlign = "center"
    m.continueLabel.vertAlign = "center"
    m.continueLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.145]
    m.continueLabel.visible = false
    
    m.answerLabel = m.top.findNode("answerLabel")
    m.answerLabel.width = m.scrWidth
    m.answerLabel.horizAlign = "center"
    m.answerLabel.translation = [0, m.scrHeight*0.5]

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

    m.bold = CreateObject("roSGNode", "Font")
    m.bold.uri = "pkg:/fonts/Bold.ttf"

    m.bouncyBalloons = CreateObject("roSGNode", "Font") 
    m.bouncyBalloons.uri = "pkg:/fonts/BouncyBalloons.ttf"

    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"

    m.gameBattles = CreateObject("roSGNode", "Font")
    m.gameBattles.uri = "pkg:/fonts/GameBattles.ttf"


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
    m.correctAnswerHighlight = m.top.findNode("correctAnswerHighlight")
    m.correctAnswerHighlightAnimation = m.top.findNode("correctAnswerHighlightAnimation")
    m.correctAnswerBitmapUri = "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/correct.png"
    m.correctAnswerHighlight.uri = m.correctAnswerBitmapUri
    m.correctAnswerHighlight.width = m.answerButtonGroup.minWidth
    m.correctAnswerHighlight.height = 83
    m.correctAnswerHighlight.visible = false
    m.correctAnswerHighlight.opacity = 0

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
            m.titleLabel.text = "Mentors" 'change the content within the quotes to change the title of your app
            m.titleTextFont = m.bold 'change the title font here
            m.titleLabel.color = "#FFFFFF" 'home title text color
        end if
    end if


    'Right aligned button group
    m.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minWidth) * 0.825, m.scrHeight*0.3]

    'Left aligned button group
    'm.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minWidth) * 0.17, m.scrHeight*0.33]  

    'Middle aligned button group - images not recommended
    'm.answerButtonGroup.translation = [(m.scrWidth - m.answerButtonGroup.minwidth)/2, m.scrHeight*0.3]

    m.background.uri = "pkg:/images/blueGradient.png" 'change background image for the homescreen here'

    m.quizAudioContent.url = "https://audio.jukehost.co.uk/019ef073-e905-7097-b200-bb8d45f7d463"
    m.quizAudio.content = m.quizAudioContent


    m.wrongAudioContent.url = "https://audio.jukehost.co.uk/H588HhEwAED259prYV3fCzkgrtujmP1v"
    m.wrongAudio.content = m.wrongAudioContent

    m.questionList.AddTail("What is the capital of France?")
    m.answersList.AddTail("Paris")

    m.questionList.AddTail("When was the Internet open to the public?")
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

    

    'Font customization
    'Use "MediumSystemFont" for Roku's default font, or use one of the custom font nodes above, like m.sunnyStar or m.superMaples.
    m.questionTextFont = m.bouncyBalloons'question text inside the search bar
    m.feedbackTextFont = m.sunnyStar'correct answer text after a wrong answer
    m.continueTextFont = m.sunnyStar '"Press OK to continue" text
    m.completedTextFont = m.superMaples'"Quiz completed!" text
    m.scoreTextFont = m.bold 'final score text
    m.tryAgainTextFont = m.bouncyBalloons'"Try Again!" text
    m.answerButtonTextFont = m.sunnyStar 'unfocused answer button text
    m.answerButtonFocusedTextFont = m.sunnyStar 'focused answer button text


    'You can adjust the text size here
    m.questionTextSize = 22 
    m.feedbackTextSize = 32 
    m.continueTextSize = 28 
    m.completedTextSize = 60 
    m.scoreTextSize = 60 
    m.tryAgainTextSize = 50 
    m.titleTextSize = 150 
    m.answerButtonTextSize = 40 

    
    'Customization ends here'

    applyLabelFont(m.tryAgainLabel, m.tryAgainTextFont, m.tryAgainTextSize)
    applyButtonGroupFonts(m.answerButtonGroup, m.answerButtonTextFont, m.answerButtonFocusedTextFont, m.answerButtonTextSize)
    if m.titleLabel <> invalid
        applyLabelFont(m.titleLabel, m.titleTextFont, m.titleTextSize)
    end if

    m.index = 0
    setQuestionLabelText(m.questionList[m.index])
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

    m.quizLeftImage = [100,m.scrHeight*0.33] 
    m.quizRightImage = [m.scrWidth*0.5, m.scrHeight*0.33] 

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

    
    'Logic for changing the image based on button group alignment in the order of right, left, middle'
    if m.answerButtonGroup.translation[0] = (m.scrWidth - m.answerButtonGroup.minwidth) * 0.825 and m.answerButtonGroup.translation[1] = m.scrHeight*0.3
        m.QuizImage.translation = m.quizLeftImage
    else if m.answerButtonGroup.translation[0] = (m.scrWidth - m.answerButtonGroup.minwidth) * 0.17 and m.answerButtonGroup.translation[1] = m.scrHeight*0.33
        m.QuizImage.translation = m.quizRightImage
    else if m.answerButtonGroup.translation[0] = (m.scrWidth - m.answerButtonGroup.minwidth)/2 and m.answerButtonGroup.translation[1] = m.scrHeight*0.3
        m.QuizImage.visible = false
    end if


end sub

sub applyLabelFont(label, fontSetting, size)
    if label = invalid or fontSetting = invalid
        return
    end if

    fontType = Type(fontSetting)
    if fontType = "String" or fontType = "roString"
        label.font = invalid
        label.textFont = fontSetting
        label.fontSize = size
    else
        sizedFont = CreateObject("roSGNode", "Font")
        sizedFont.uri = fontSetting.uri
        sizedFont.size = size
        label.font = sizedFont
    end if
end sub

function getSizedFont(fontSetting, size)
    if fontSetting = invalid
        return invalid
    end if

    fontType = Type(fontSetting)
    if fontType = "String" or fontType = "roString"
        return fontSetting
    end if

    sizedFont = CreateObject("roSGNode", "Font")
    sizedFont.uri = fontSetting.uri
    sizedFont.size = size
    return sizedFont
end function

sub applyButtonGroupFonts(buttonGroup, textFontSetting, focusedFontSetting, textSize)
    if buttonGroup = invalid
        return
    end if

    if textFontSetting <> invalid
        buttonGroup.textFont = getSizedFont(textFontSetting, textSize)
    end if

    if focusedFontSetting <> invalid
        buttonGroup.focusedTextFont = getSizedFont(focusedFontSetting, textSize)
    end if
end sub

function getCenteredLabelX(labelWidth as Float) as Float
    return (m.scrWidth - labelWidth) / 2
end function

sub setQuestionLabelText(text as String)
    m.questionLabel.width = m.scrWidth * 0.57
    m.questionLabel.height = m.scrHeight * 0.13
    m.questionLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.087]
    m.questionLabel.maxLines = 1
    m.questionLabel.visible = true
    m.continueLabel.visible = false

    applyLabelFont(m.questionLabel, m.questionTextFont, m.questionTextSize)
    m.questionLabel.text = text
end sub

sub setQuestionFeedbackText(text as String)
    m.questionLabel.width = m.scrWidth * 0.57
    m.questionLabel.height = m.scrHeight * 0.08
    m.questionLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.078]
    m.questionLabel.maxLines = 1

    applyLabelFont(m.questionLabel, m.feedbackTextFont, m.feedbackTextSize)
    m.questionLabel.text = text
    setContinueLabelText("Press OK to continue")
end sub

sub setContinueLabelText(text as String)
    m.continueLabel.width = m.scrWidth * 0.57
    m.continueLabel.height = m.scrHeight * 0.06
    m.continueLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.158]
    m.continueLabel.horizAlign = "center"
    m.continueLabel.vertAlign = "center"
    m.continueLabel.visible = true

    applyLabelFont(m.continueLabel, m.continueTextFont, m.continueTextSize)
    m.continueLabel.text = text
end sub

sub setCenteredContinueLabelText(text as String)
    m.questionLabel.visible = false
    m.continueLabel.width = m.scrWidth * 0.57
    m.continueLabel.height = m.scrHeight * 0.13
    m.continueLabel.translation = [m.scrWidth * 0.27,m.scrHeight * 0.087]
    m.continueLabel.horizAlign = "center"
    m.continueLabel.vertAlign = "center"
    m.continueLabel.visible = true

    applyLabelFont(m.continueLabel, m.continueTextFont, m.continueTextSize)
    m.continueLabel.text = text
end sub

sub setCompletedQuestionLabelText(text as String)
    m.questionLabel.width = m.scrWidth
    m.questionLabel.height = m.scrHeight * 0.13
    m.questionLabel.translation = [getCenteredLabelX(m.questionLabel.width),m.scrHeight * 0.087]
    m.questionLabel.maxLines = 1
    m.questionLabel.visible = true
    m.continueLabel.visible = false
    applyLabelFont(m.questionLabel, m.completedTextFont, m.completedTextSize)
    m.questionLabel.text = text
end sub

function getCorrectAnswerIndex() as Integer
    correctAnswer = m.answersList[m.index]
    choices = m.answerButtonGroup.buttons

    for i = 0 to choices.Count() - 1
        if choices[i] = correctAnswer
            return i
        end if
    end for

    return -1
end function

sub showCorrectAnswerHighlight()
    correctIndex = getCorrectAnswerIndex()
    if correctIndex < 0
        return
    end if

    correctButton = m.answerButtonGroup.getChild(correctIndex)
    if correctButton <> invalid
        correctButton.textColor = "#000000"
        correctButton.focusedTextColor = "#000000"
    end if

    buttonHeight = 83
    buttonSpacing = 20
    m.correctAnswerHighlight.translation = [
        m.answerButtonGroup.translation[0],
        m.answerButtonGroup.translation[1] + (correctIndex * (buttonHeight + buttonSpacing))
    ]
    m.correctAnswerHighlight.visible = true
    m.correctAnswerHighlight.opacity = 0
    m.correctAnswerHighlightAnimation.control = "start"
end sub

sub resetAnswerFeedback()
    m.answerButtonGroup.focusFootprintBitmapUri = ""
    m.correctAnswerHighlightAnimation.control = "stop"
    m.correctAnswerHighlight.visible = false
    m.correctAnswerHighlight.opacity = 0
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

    selectedIndex = m.answerButtonGroup.buttonSelected
    selectedContent = m.answerButtonGroup.buttons[selectedIndex]
    keepSelectedAnswerBlack(selectedIndex)

    if selectedContent = m.answersList[m.index]
        setCenteredContinueLabelText("Press OK to continue")
        m.answerButtonGroup.setFocus(false)
        m.answerButtonGroup.focusFootprintBitmapUri= m.correctAnswerBitmapUri
        m.score = m.score + 1
    
    else
        setQuestionFeedbackText("Correct answer: " + m.answersList[m.index])
        m.answerButtonGroup.setFocus(false)
        m.wrongAudio.control = "play"
        m.answerButtonGroup.focusFootprintBitmapUri= "https://raw.githubusercontent.com/Cheemifyde/RoQuiz/refs/heads/master/images/incorrect.png"
        showCorrectAnswerHighlight()

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
                resetAnswerFeedback()
                setQuestionLabelText(m.questionList[m.index])
                m.answerButtonGroup.buttons = m.choicesBank[m.index]
                m.QuizImage.uri = m.QuizImageList[m.index]
                m.answerButtonGroup.setFocus(true)
                m.answerButtonGroup.visible = true
                m.answerLabel.visible = false
            else
                resetAnswerFeedback()
                setCompletedQuestionLabelText("Quiz completed!")
                m.QuizImage.visible = false
                m.answerButtonGroup.visible = false
                m.answerLabel.visible = true
                applyLabelFont(m.answerLabel, m.scoreTextFont, m.scoreTextSize)
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
