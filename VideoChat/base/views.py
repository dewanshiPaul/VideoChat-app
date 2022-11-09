from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
# Create your views here.

#to generate token
def generateToken(request):
    uid = random.randint(1,300), 
    token = RtcTokenBuilder.buildTokenWithUid(
        appId='35fb83f1b23b4ee3b3caa491ba174658', 
        appCertificate='fd7d4b089fb344cb9776764a211ef9c4', 
        channelName= request.GET.get('channel'), 
        uid = 0,
        role = 1, #assuming everyone as host since authentication is not required
        privilegeExpiredTs = int(time.time()) + (3600 * 24)
    )

    return JsonResponse({
        'token': token,
        'uid': uid,
    }, safe=False)
    
def lobby(request):
    return render(request, 'base/lobby.html')

def room(request,room_name):
    return render(request, 'base/room.html', {
        'room_name': room_name
    })