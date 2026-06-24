sub init()
	m.splash_video = m.top.findNode("splash_video")
	m.splash_timer = createObject("roSGNode", "Timer")
	m.splash_timer.duration = 5
	m.splash_timer.observeField("fire", "onSplashTimerFire")
	playSplashAnimation()
end sub

sub playSplashAnimation()
	splash_content = CreateObject("roSGNode", "ContentNode")
	splash_content.url = "pkg:/images/splashScreen.mp4"
	splash_content.streamformat = "mp4"
	m.splash_video.content = splash_content
	m.splash_video.control ="prebuffer"
	m.splash_video.visible = true
	m.splash_video.setFocus(true)
	m.splash_video.control = "play"
	m.splash_timer.control = "start"
end sub

sub onSplashTimerFire()
	m.top.splash_finished = "finished"
end sub