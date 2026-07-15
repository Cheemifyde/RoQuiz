sub init()
    'Initalizing screen res
    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h

    m.background = m.top.findNode("background")
    m.background.width = m.scrWidth
    m.background.height = m.scrHeight

    m.tutorialLabel = m.top.findNode("tutorialLabel")
    m.tutorialLabel.width = m.scrWidth
    m.tutorialLabel.horizAlign = "center"
    m.tutorialLabel.translation = [0,75]

    m.tutorialOverlay = m.top.findNode("tutorialOverlay")

    m.tutorialStar = m.top.findNode("tutorialStar")
    m.tutorialStar.width = 40
    m.tutorialStar.height = 40
    m.tutorialStar.horizAlign = "center"
    m.tutorialStarAnimation = m.top.findNode("tutorialStarAnimation")
    m.tutorialStarPath = m.top.findNode("tutorialStarPath")
    m.tutorialStarTwinkle = m.top.findNode("tutorialStarTwinkle")
    m.starPlaying = false
    
    m.buttonGroup = m.top.findNode("homeButtonGroup")
    m.buttonGroup.translation = [m.scrWidth*0.3, m.scrHeight*0.4]
    m.buttonGroup.observeField("buttonSelected", "buttonSelected")
    
  
    
    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 37

    m.starFont = CreateObject("roSGNode", "Font")
    m.starFont.uri = "pkg:/fonts/SunnyStar.ttf"
    m.starFont.size = 70
    m.tutorialStar.font = m.starFont

    m.tutorialLabel.font = m.sunnyStar
    
    m.homeAudio = createObject("roSGNode", "Audio")
    m.homeAudioContent = createObject("RoSGNode", "ContentNode")
    m.homeAudioContent.url = "https://audio.jukehost.co.uk/019ed68b-fc2b-72d9-a7c4-78bc8678d512"
    m.homeAudio.content = m.homeAudioContent
    m.homeAudio.loop = true
    m.global.addFields({ homeAudio: m.homeAudio })

    m.bold = CreateObject("roSGNode", "Font")
    m.bold.uri = "pkg:/fonts/Bold.ttf"
    m.bold.size = 150

    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 60

    m.titleLabel = m.top.findNode("title")
    m.titleLabel.font = m.bold 
    m.titleLabel.width = m.scrWidth 
    m.titleLabel.horizAlign = "center"


    m.qrCode = m.top.findNode("qrCode")
    m.qrCode.width = m.scrWidth
    m.qrCode.height = m.scrHeight
    

    m.buttonGroup.visible = false
    m.titleLabel.visible = false

    m.splashActive = true
    m.splashVideo = m.top.findNode("splashVideo")
    m.splashVideo.width = m.scrWidth
    m.splashVideo.height = m.scrHeight
    m.splashVideo.translation = [0, 0]

    splashContent = createObject("RoSGNode", "ContentNode")
    splashContent.url = "pkg:/videos/splashScreen.mp4"
    m.splashVideo.content = splashContent
    m.splashVideo.observeField("state", "onSplashStateChange")
    m.splashVideo.control = "play"

end sub

sub onSplashStateChange()
    state = m.splashVideo.state
    if state = "finished" or state = "error"
        endSplash()
    end if
end sub

sub endSplash()
    if not m.splashActive then return
    m.splashActive = false
    m.splashVideo.control = "stop"
    m.splashVideo.visible = false
    showHome()
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press then
        if m.splashActive
            handled = true
            endSplash()
            return handled
        end if

        

        if key = "back"
            handled = true
            if m.starPlaying
                hideTutorial()
            else
                selectedIndex = m.buttonGroup.buttonSelected
                if selectedIndex = 0
                    if m.customizeScreen <> invalid
                        m.customizeScreen.callFunc("stopQuizAudio")
                        m.customizeScreen.setFocus(false)
                        m.top.removeChild(m.customizeScreen)
                        m.customizeScreen = invalid
                    end if
                    showHome()
                end if
            end if
        end if
    return handled
    end if
end function



sub hideHome()
    m.buttonGroup.setFocus(false)
    m.buttonGroup.visible = false
    m.background.visible = false
    m.titleLabel.visible = false
    m.global.homeAudio.control = "stop"
end sub

sub playHomeAudio()
    if m.global.homeAudio.state <> "playing"
        m.global.homeAudio.control = "play"
    end if
end sub

sub showHome()
    m.buttonGroup.visible = true
    m.buttonGroup.setFocus(true)
    m.background.visible = true
    m.titleLabel.visible = true
    playHomeAudio()
end sub

sub showTutorial()
    m.buttonGroup.setFocus(false)
    m.buttonGroup.visible = false
    m.titleLabel.visible = false
    m.tutorialOverlay.visible = true
    startTutorialStarAnimation()
    m.starPlaying = true
    m.top.setFocus(true)
end sub

sub hideTutorial()
    m.tutorialStarAnimation.control = "stop"
    m.tutorialOverlay.visible = false
    m.starPlaying = false
    showHome()
end sub

sub startTutorialStarAnimation()
    textTop = m.tutorialLabel.translation[1] 'y value of label
    waveCenter = textTop + (m.tutorialLabel.height * 0.5) 
    startX = m.scrWidth * 0.18
    endX = m.scrWidth * 0.82
    stepX = (endX - startX) / 8

    m.tutorialStarPath.keyValue = [
        [startX, waveCenter],
        [startX + stepX, waveCenter - 35],
        [startX + (stepX * 2), waveCenter],
        [startX + (stepX * 3), waveCenter + 35],
        [startX + (stepX * 4), waveCenter],
        [startX + (stepX * 5), waveCenter - 35],
        [startX + (stepX * 6), waveCenter],
        [startX + (stepX * 7), waveCenter + 35],
        [endX, waveCenter]
    ]

    m.tutorialStarAnimation.control = "start"
end sub

sub buttonSelected()
    selectedIndex = m.buttonGroup.buttonSelected

    if selectedIndex = 1 and m.starPlaying
        return
    end if

    if selectedIndex = 0
        hideHome()
        m.customizeScreen = createObject("roSGNode", "customizeScreen")
        m.top.appendChild(m.customizeScreen)
        m.customizeScreen.setFocus(true)
    else if selectedIndex = 1
        showTutorial()
    end if
end sub
