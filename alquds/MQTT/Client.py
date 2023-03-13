import ssl
import paho.mqtt.client as mqtt
import time



def on_message(client, userdata, message):
    print ( message.payload)

def on_connect(client, userdata, flags, rc):

    if rc == 0:

        print("Connected to broker")

        global Connected                #Use global variable
        Connected = True                #Signal connection 

    else:

        print("Connection failed")

def on_publish(client,userdata,result):             #create function for callback
    print("data published \n")
    pass

Connected = False #global variable for the state of the connection

broker_address= "localhost"
port = 1883
user = "sherif"
password = "s123"


client = mqtt.Client("MQTT")          #create new instance
client.username_pw_set(user, password=password)    #set username and password
client.tls_set(cert_reqs=ssl.CERT_REQUIRED)
client.on_connect= on_connect                      #attach function to callback
client.on_message= on_message 


client.connect(broker_address, port=port)  #connect to broker
client.loop_start()                       #start the loop

while Connected != True:    #Wait for connection
    time.sleep(0.2)

client.subscribe("python/test")
# client.publish("python/test","on")


try:
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print ("exiting")
    client.disconnect()
    client.loop_stop()