
import LayoutContainer from "components/LayoutContainer";
import './styles.css'
import SetKey from "components/SetKey"

interface IRoom {
    name: string
    key: string
}

interface IRoomProps {
    visible: boolean
    room: IRoom | null
}

function Room({visible, room}: IRoomProps) {
    let visibleState = 'hidden';
    if (visible) {
        visibleState = 'shown'
    }
    return (
        <div className={`room ${visibleState}`}>
            {room? <p className="roomNameBanner">Room: {room.name}</p> : null}
            <LayoutContainer
            id="cameraContainer"
            size="big"
            />
        <SetKey></SetKey>
        </div>
    )
}
export default Room;