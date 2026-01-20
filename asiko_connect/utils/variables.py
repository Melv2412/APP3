from Buzzer import ESP32_IP


SEUIL_CRITIQUE=100
POURCENTAGE_SEUIL_ALERT=0.8

'''
Temps de calculs en secondes pour le temps de calcule
des moyennes IQA au cours des phases avant changement
de phase
''' 


DUREE_CALCUL_IQA_PHASE_1=5
DUREE_CALCUL_IQA_PHASE_2=5

DUREE_CALCUL_IQA_PHASE_3=10

'''Temps avant changement de phase en secondes'''
PASSAGE_PHASE_1=5 # en secondes TASK ALERTS
PASSAGE_PHASE_1_TO_2=5  # en secondes TASK ALERTS
PASSAGE_PHASE_2_TO_3=10  # en secondes  TASK ALERTS


'''Message à vocaliser 
par le frontend lors de la création d'une alerte'''

MESSAGE_A_VOCAL="Bonsoir monsieur Martial, Attention, un niveau de pollution élevé a été détecté. Veuillez prendre les précautions nécessaires pour votre santé."

ESP32_IP = "192.168.137.197"