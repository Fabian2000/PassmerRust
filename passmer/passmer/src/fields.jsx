import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './sidebar';

export function Fields() {
    const { sectionId } = useParams();

    useEffect(() => {
        console.log(`Fields for section ${sectionId}`);
    }, [sectionId]);

    return (
        <div className='fields-layout'>
            <div className='sidebar-wrapper'>
                <Sidebar />
            </div>
            <div className='fields'>
                <div className='fields-header'>
                    <h1>Fields</h1>
                </div>
            </div>
        </div>
    );
}

export default Fields;