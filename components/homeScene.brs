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
    m.tutorialLabel.translation = [0,100]
    
    m.buttonGroup = m.top.findNode("homeButtonGroup")
    m.buttonGroup.translation = [m.scrWidth*0.3, m.scrHeight*0.4]
    m.buttonGroup.observeField("buttonSelected", "buttonSelected")
    
  
    
    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 37

    m.tutorialLabel.font = m.sunnyStar
    
    m.homeAudio = createObject("roSGNode", "Audio")
    m.homeAudioContent = createObject("RoSGNode", "ContentNode")
    m.homeAudioContent.url = "https://audio.jukehost.co.uk/019ed68b-fc2b-72d9-a7c4-78bc8678d512"
    m.homeAudio.content = m.homeAudioContent
    m.homeAudio.loop = true

    m.bold = CreateObject("roSGNode", "Font")
    m.bold.uri = "pkg:/fonts/Bold.ttf"
    m.bold.size = 150

    m.sunnyStar = CreateObject("roSGNode", "Font")
    m.sunnyStar.uri = "pkg:/fonts/SunnyStar.ttf"
    m.sunnyStar.size = 37

    m.titleLabel = m.top.findNode("title")
    m.titleLabel.font = m.bold 
    m.titleLabel.width = m.scrWidth 
    m.titleLabel.horizAlign = "center"

    m.tutorialLabel.font = m.sunnyStar

    m.qrCode = m.top.findNode("qrCode")
    m.qrCode.visible = false
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
                m.qrCode.visible = false
                ? m.qrCode.visible.ToStr()
                selectedIndex = m.buttonGroup.buttonSelected
            if selectedIndex = 0
                m.customizeScreen.setFocus(false)
                m.top.removeChild(m.customizeScreen)
                showHome()
            else if selectedIndex = 1
                m.qrCode.visible = false
                m.tutorialLabel.visible = false
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
    m.homeAudio.control = "stop"
end sub

sub showHome()
    m.buttonGroup.visible = true
    m.buttonGroup.setFocus(true)
    m.background.visible = true
    m.titleLabel.visible = true
    m.homeAudio.control = "play"
end sub

sub buttonSelected()
    hideHome()
    selectedIndex = m.buttonGroup.buttonSelected
    if selectedIndex = 0
        m.customizeScreen = createObject("roSGNode", "customizeScreen")
        m.top.appendChild(m.customizeScreen)
        m.customizeScreen.setFocus(true)
    else if selectedIndex = 1
        m.qrCode.visible = true
        m.tutorialLabel.visible = true
        showHome()
    end if
end sub