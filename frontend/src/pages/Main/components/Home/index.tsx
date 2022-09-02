import React, { ChangeEvent, useRef, useState, useContext } from 'react';
import './styles.css'
import { MeContext } from 'contexts/me';
import { SessionContext } from 'contexts/session';
import User from 'entities/user';

interface IhomeProps {
    visible: Boolean
    setRoom: Function
}
function Home({visible, setRoom} : IhomeProps) {
    const roomRef = useRef<HTMLInputElement>(null);
    const keyRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const [role, setRole] = useState<string>('host');
    const mMe = useContext(MeContext);
    const mSession = useContext(SessionContext);


    function onJoinButtonClick() {
        if (!nameRef.current || !nameRef.current.value) return alert('Please enter your name');
        if (!roomRef.current || !roomRef.current.value) return alert('Please enter a room name');
        let key;
        if (mSession.e2eeEnable && keyRef.current && keyRef.current.value.length < 8 ) return alert("Valid key length 8-256 character")
        if (mSession.e2eeEnable && keyRef.current) key = keyRef.current.value; 
        let user: User = {
            name: nameRef.current.value, 
            role
        }
        mMe.loginUser(user);
        setRoom({name: roomRef.current.value, key})
    }

    function e2eStateChange(e: ChangeEvent<HTMLInputElement>) {
        mSession.e2eeEnableState(e.currentTarget.checked)
    }
    // function onRoleChange(e: ChangeEvent<HTMLInputElement>) {
    //     setRole(e.target.value);
    // }
    if (visible) {
        return (
        <div className='home'>
            <h1>Join A Room</h1>
            <label htmlFor="name">Name:</label>
            <input ref={nameRef} type="text" name="name" id="name" placeholder='Your name'></input>
            <label htmlFor="room-name">Room Name:</label>
            <input ref={roomRef} type="text" name="room-name" id="room-name" placeholder='Room name'></input>
            <div className='e2eeState'>
                <input type="checkbox" id="e2e" name="e2e" onChange={e2eStateChange}></input>
                <label htmlFor="e2e"> E2EE enable</label>
            </div>
            {mSession.e2eeEnable ?
            ( <>
                <label htmlFor="key">Key:</label>
                <input ref={keyRef} type="text" name="key" id="key" minLength={8} maxLength={256} placeholder='valid key 8-256 characters'></input>
              </>
            ): null            
            }
            {/* <div className='role' onChange={onRoleChange}>
                <input type="radio" id="host" name="role" value="host" checked></input>
                <label htmlFor="host">Host</label>
                <input type="radio" name="role" value="participant"></input>
                <label htmlFor="participant">Participant</label>
            </div> */}
            <button onClick={onJoinButtonClick}>Join</button>
        </div>
        )
        
    }
    else {
        return null;
    }

}
export default Home;