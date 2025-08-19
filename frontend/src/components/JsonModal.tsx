import React from 'react';
import Icon, {IconName} from './Icon';
import JsonView from './JsonView';

export default function JsonModal({
                                      isOpen,
                                      onClose,
                                      title,
                                      data,
                                      iconName,
                                  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    iconName?: IconName;
}) {
    if (!isOpen) return null;

    const handleOverlayClick = () => onClose();
    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" onClick={stop}>
                <div className="modal-header">
                    <h3 className="card-title">
                        {iconName && <Icon name={iconName}/>} {title}
                    </h3>
                    <button className="btn" onClick={onClose}>
                        <Icon name="x-circle"/>
                        Close
                    </button>
                </div>
                <div className="modal-body">
                    <JsonView data={data}/>
                </div>
            </div>
        </div>
    );
}
