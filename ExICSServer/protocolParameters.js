// Protocol Information

var PACKET_TYPE = {
	PROTOCOL_HANDSHAKE: 0,
	USER_CONNECTED: 1,
	USER_DISCONNECTED: 2,
	SYSTEM_STATE: 3,
	CHANGE_ROOM: 4,
	EXAM_START: 5,
	EXAM_PAUSE: 6,
	EXAM_STOP: 7,
	EXAM_XTIME: 8,
	SEND_MESSAGE_ALL: 9,
	SEND_MESSAGE_ROOM: 10,
	SEND_MESSAGE_USER: 11,
	SUCCESS: 69,
	FAILURE: -1,
	TERMINATE_CONNECTION: -2
};

/*
header
  type = PROTOCOL_HANDSHAKE (0)
  sender = username
  room = room
payload
  username = username 
  password = password

header
  type = USER_CONNECTED (1)
  sender = 'SYS'
payload
  username = uname
  room = room

header
  type = USER_DISCONNECTED (2)
  sender = 'SYS'
payload
  username = uname
  room = room

header 								       header
  type = SYSTEM_STATE (3)		   type = SYSTEM_STATE
  sender = username 				   sender = 'SYS'
  									         payload
  									           users = []
  									           exams = {}

header                        header
  type = CHANGE_ROOM (4)        type = CHANGE_ROOM
  sender = 'username'           sender = 'SYS'
payload                       payload
  room = room                   username = uname
                                room = room

header
  type = EXAM_START (5)
  sender = 'username'
payload
  room = room
  exam = exammodulecode

header
  type = EXAM_PAUSE (6)
  sender = 'username'
payload
  room = room
  exam = exammodulecode

header
  type = EXAM_STOP (7)
  sender = 'username'
payload
  room = room
  exam = exammodulecode

header
  type = EXAM_XTIME (8)
  sender = 'username'
payload
  room = room
  exam = exammodulecode
  time = XtraTimeAmount

header
  type = SUCCESS (69)
  sender = 'SYS'
payload
  message = message


header
  type = FAILURE (-1)
  sender = 'SYS'
  receiver = original receiver
payload = original payload
  reason = reason

header
  type = TERMINATE_CONNECTION (-2)
  sender = 'username'


*/

exports.PACKET_TYPE = PACKET_TYPE;