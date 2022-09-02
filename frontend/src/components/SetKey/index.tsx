import { useRef, useContext, useState } from 'react';
import './styles.css';
import { SessionContext } from 'contexts/session'

function SetKey() {
    const keyRef = useRef<HTMLInputElement>(null);
    const mSession = useContext(SessionContext);
    const [ buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    async function onChangeKeyButtonClick() {
        setButtonDisabled(true);
        if (keyRef.current && keyRef.current.value) {
            if (keyRef.current.value.length < 8 ) {
                setButtonDisabled(false);
                return alert("Valid key length 8-256 character")
            }
            const newKey = await mSession.changeEncryptionKey(keyRef.current.value);
            keyRef.current.value = '';
            alert(`key change: ${newKey} `)
        }
        setButtonDisabled(false);
    }

    return (
    <div className='setkey'>
        <label htmlFor="key">New Key: </label>
        <input ref={keyRef} type="text" name="key" id="key" minLength={8} maxLength={256} placeholder='valid key 8-256 characters'></input>
        <button onClick={onChangeKeyButtonClick} disabled={buttonDisabled}>Change</button>
    </div>
    )
}

export default SetKey