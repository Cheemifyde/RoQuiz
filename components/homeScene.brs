sub init()

    
    'Initalizing screen res
    deviceInfo = createObject("roDeviceInfo")
    m.scrWidth = deviceInfo.getDisplaySize().w
    m.scrHeight = deviceInfo.getDisplaySize().h
    

    'Background, will be changed by Ethan
    m.splash_screen = m.top.findNode("splash_screen")
    m.splash_screen.observeField("splash_finished", "onSplashFinished")
    m.splash_screen.setFocus(true)
   
    m.TutorialPoster = m.top.findNode("background")
    m.TutorialPoster.width = m.scrWidth
    m.TutorialPoster.height = m.scrHeight

    m.buttonGroup = m.top.findNode("CustomizeandTutorialGroup")
    m.buttonGroup.translation = [m.scrWidth*0.3, m.scrHeight*0.4]
    
    m.CustomizeButton = m.top.findNode("CustomizeButton")
    m.CustomizeButton.observeField("buttonSelected", "CustomizeSelected")

    m.TutorialButton = m.top.findNode("TutorialButton")
    m.TutorialButton.observeField("buttonSelected", "TutorialSelected")
    

    m.homeAudio = createObject("roSGNode", "Audio")
    m.homeAudioContent = createObject("RoSGNode", "ContentNode")
    m.homeAudioContent.url = "https://audio.jukehost.co.uk/019ed68b-fc2b-72d9-a7c4-78bc8678d512"
    m.homeAudio.content = m.homeAudioContent
    m.homeAudio.control = "play"
    m.homeAudio.loop = true


end sub

sub onSplashFinished(obj)
	if m.splash_screen.getField("splash_finished") = "finished" then
		m.splash_video = m.splash_screen.findNode("splash_video")
		m.splash_video.visible = false
		m.splash_screen.visible = false
		m.TutorialPoster.visible = true
        m.buttonGroup.visible = true
        m.TutorialButton.visible = true
        m.CustomizeButton.visible = true
		m.buttonGroup.setFocus(true)
	end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
handled = false

if press then

    if key = "back"
        handled = true
        m.customize.setFocus(false)
        m.top.removeChild(m.customize)
        show()
    end if
 return handled
end if

end function



sub Hide()
    m.buttonGroup.setFocus(false)
    m.buttonGroup.visible = false
    m.TutorialPoster.visible = false
   
   
    m.homeAudio.control = "stop"
end sub

sub show()

    m.buttonGroup.setFocus(true)
    m.buttonGroup.visible = true
    m.TutorialPoster.visible = true
    m.homeAudio.control = "play"

end sub

sub CustomizeSelected()
    Hide()
    m.customize = createObject("roSGNode", "Customize")
    m.top.appendChild(m.customize)
    m.customize.setFocus(true)
end sub