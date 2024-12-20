import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import './style/customPicker.css';
import Sidebar from './sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faParagraph, faFont, faKey, faLeftLong, faRightLong, faGear, faTrash, faRightLeft, faPen, faEyeSlash, faCopy, faKeyboard, faComment, faFingerprint, faPhone, faClock, faCalendar, faBusinessTime, faHashtag, faLink, faSave, faArrowsRotate, faArrowUpRightFromSquare, faBan, faPowerOff  } from '@fortawesome/free-solid-svg-icons';
import * as Invokes from './invokes';

export function Fields() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [showAddFieldPopup, setShowAddFieldPopup] = useState(false);
    const [showOptionFieldPopup, setShowOptionFieldPopup] = useState(false);
    const [showDeleteFieldPopup, setShowDeleteFieldPopup] = useState(false);
    const typeSelectionPopup = useRef(null);
    const optionFieldPopup = useRef(null);
    const deleteFieldPopup = useRef(null);
    const [newFieldTitle, setNewFieldTitle] = useState("");
    const [lastSelectedFieldId, setLastSelectedFieldId] = useState(-1);
    const [selectedSectionTitle, setSelectedSectionTitle] = useState("");
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFactorKey, setTwoFactorKey] = useState("");
    const [twoFactorType, setTwoFactorType] = useState("totp");
    const remoteTypingTimeoutRef = useRef(null);

    useEffect(() => {
        reRenderFieldItems(sectionId);
    }, [sectionId]);

    useEffect(() => {
        Invokes.getSidebarTitleById(parseInt(sectionId)).then((title) => setSelectedSectionTitle(title));
    }, [sectionId]);

    const reRenderFieldItems = (sectionId) => {
        Invokes.getFields(parseInt(sectionId)).then((fields) => {
            fields.sort((a, b) => a.order_id - b.order_id);
            setFields(fields);
        });
    }

    const bindFieldTitleValue = (e) => {
        setNewFieldTitle(e.target.value);
    }    

    const bind2FaKeyValue = (e) => {
        setTwoFactorKey(e.target.value);
    }

    const bind2FaKeyType = (e) => {
        setTwoFactorType(e.target.value);
    }

    const random = Math.random().toString(36).substring(7);

    const swapFieldItemsLeft = (sectionId, fieldId) => {
        let fieldIndex = fields.findIndex((item) => item.field_id == fieldId);
        if (fieldIndex > 0) {
            Invokes.swapOrderIds(parseInt(sectionId), fieldId, fields[fieldIndex - 1].field_id).then(() => {
                reRenderFieldItems(sectionId);
            });
        }
    }

    const swapFieldItemsRight = (sectionId, fieldId) => {
        let fieldIndex = fields.findIndex((item) => item.field_id == fieldId);
        if (fieldIndex < fields.length - 1) {
            Invokes.swapOrderIds(parseInt(sectionId), fieldId, fields[fieldIndex + 1].field_id).then(() => {
                reRenderFieldItems(sectionId);
            });
        }
    }

    const deleteFieldItem = (sectionId, fieldId) => {
        Invokes.deleteField(parseInt(sectionId), fieldId).then(() => {
            setLastSelectedFieldId(-1);
            reRenderFieldItems(sectionId);
        });
    }

    const customInputLoad = (id, value) => {
        if (document.getElementById(id)) {
            document.getElementById(id).value = value;
        }
    };

    const setDatePickr = (id, value) => {
        setTimeout(() => {
            document.getElementById(id)._flatpickr.setDate(value);
        }, 1000)
    };

    const remoteTypeText = (id) => {
        document.querySelector(".remote-typing").classList.add("show");
        remoteTypingTimeoutRef.current = setTimeout(() => {
            Invokes.remoteTypeText(document.getElementById(id).value);
            document.querySelector(".remote-typing").classList.remove("show");
        }, 10_000);
    }

    const cancelRemoteTypeText = () => {
        clearTimeout(remoteTypingTimeoutRef.current);
        document.querySelector(".remote-typing").classList.remove("show");
    }

    return (
        <div className="fields-layout">
            <div className="sidebar-wrapper">
                <Sidebar />
            </div>
            <div className="fields">
                <div className="fields-header">
                    <button className="btn animate-whoosh" title="Navigate back" onClick={ ()=> navigate("/sidebar", { "replace" : true }) }>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <b className="title">
                        {selectedSectionTitle}
                    </b>
                    <button className="btn animate-wiggle" title="New Field" onClick={
                        () => {
                            setShowAddFieldPopup(!showAddFieldPopup);
                            if (typeSelectionPopup.current) {
                                setTimeout(() => {
                                    typeSelectionPopup.current.focus();
                                }, 10);
                            }
                        }
                    
                    }>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>

                {
                    // Add field popup
                }
                <div className={`add-field-popup ${ showAddFieldPopup ? "show" : "" }`} tabIndex={0} ref={typeSelectionPopup} onKeyDown={
                    (e) => {
                        if (e.key === "Escape") {
                            setShowAddFieldPopup(false);
                            setNewFieldTitle("");
                        }
                    }
                } onClick={(e) => {
                    if (e.target.tagName != "INPUT" && e.target.tagName != "BUTTON") { 
                        setShowAddFieldPopup(false);
                        setNewFieldTitle("");
                    }}}>
                    <div className="add-field-sidebar">
                        <h2 className="title">Choose a Field Type:</h2>
                        <input type="text" className="input" placeholder="Name the field" value={newFieldTitle} onChange={bindFieldTitleValue} autoComplete={'passmer' + random} />
                        <div className="scrollable-options">
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.TEXT).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            } }><FontAwesomeIcon icon={faFont} /> Text</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.PASSWORD).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faKey} /> Password</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.NOTES).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faComment} /> Comment</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.SPLIT).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faParagraph} /> Splitter</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.TWO_FACTOR).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faFingerprint} /> 2FA Code</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.TIME).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faClock} /> Time</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.DATE).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faCalendar} /> Date</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.DATETIME).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faBusinessTime} /> DateTime</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.PHONE).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faPhone} /> Phone</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.NUMBER).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faHashtag} /> Number</button>
                            <button className="option" onClick={ () => {
                                Invokes.addField(parseInt(sectionId), newFieldTitle, "", Invokes.fieldTypes.URL).then(() => {
                                    setNewFieldTitle("");
                                    setShowAddFieldPopup(false);
                                    setTimeout(() => {
                                        reRenderFieldItems(sectionId);
                                    }, 1000);
                                });
                            }}><FontAwesomeIcon icon={faLink} /> URL</button>
                        </div>
                    </div>
                </div>
                
                {
                    // Option field popup
                }
                <div className={`add-field-popup ${ showOptionFieldPopup ? "show" : "" }`} tabIndex={0} ref={optionFieldPopup} onKeyDown={
                    (e) => {
                        if (e.key === "Escape") {
                            setShowOptionFieldPopup(false);
                            setNewFieldTitle("");
                            setShow2FASetup(false);
                        }
                    }
                } onClick={(e) => {
                    if (e.target.tagName != "INPUT" && e.target.tagName != "BUTTON" && e.target.tagName != "SELECT") { 
                        setShowOptionFieldPopup(false);
                        setNewFieldTitle("");
                        setShow2FASetup(false);
                    }}}>
                    <div className="add-field-sidebar">
                        <h2 className="title">Field Options:</h2>
                        <input type="text" className="input" placeholder="Name the field" value={newFieldTitle} onChange={bindFieldTitleValue} autoComplete={'passmer' + random} />
                        <button className="option" onClick={ () => {
                            Invokes.renameField(parseInt(sectionId), lastSelectedFieldId, newFieldTitle);
                            setShowOptionFieldPopup(false);
                            setNewFieldTitle("");
                            setTimeout(() => {
                                reRenderFieldItems(sectionId);
                            }, 1000);
                        } }><FontAwesomeIcon icon={faPen} /> Rename</button>
                        { /* Don't load and show the old 2FA key (from DB), only enable to update with a new one. */ }
                        <input type="text" className={`input ${ show2FASetup ? "d-block" : "d-none" }`} placeholder="Add 2FA Key" onChange={bind2FaKeyValue} autoComplete={'passmer' + random} />
                        <select className={`select ${ show2FASetup ? "d-block" : "d-none" }`} onChange={bind2FaKeyType} autoComplete={'passmer' + random} >
                            <option value="totp">TOTP</option>
                            <option value="hotp">HOTP</option>
                        </select>
                        <button  className={`option ${ show2FASetup ? "d-block" : "d-none" }`} onClick={ () => {
                            Invokes.setFactorField(parseInt(sectionId), lastSelectedFieldId, twoFactorKey, twoFactorType);
                            setShowOptionFieldPopup(false);
                            setNewFieldTitle("");
                            setShow2FASetup(false);
                            setTimeout(() => {
                                reRenderFieldItems(sectionId);
                            }, 1000);
                        } }><FontAwesomeIcon icon={faSave} /> Save</button>
                    </div>
                </div>
                
                {
                    // Delete field popup
                }
                <div className={`add-field-popup ${ showDeleteFieldPopup ? "show" : "" }`} tabIndex={0} ref={deleteFieldPopup} onKeyDown={
                    (e) => {
                        if (e.key === "Escape") {
                            setShowDeleteFieldPopup(false);
                        }
                    }
                } onClick={(e) => {
                    if (e.target.tagName != "BUTTON") { 
                        setShowDeleteFieldPopup(false);
                    }}}>
                    <div className="add-field-sidebar">
                        <h2 className="title">Delete field?</h2>
                        <button className="option" onClick={ () => {
                            deleteFieldItem(sectionId, lastSelectedFieldId);
                            setShowDeleteFieldPopup(false);
                        } }>Yes</button>
                        <button className="option" onClick={ () => {
                            setShowDeleteFieldPopup(false);
                        }}>No</button>
                    </div>
                </div>

                <div className="remote-typing">
                    <h2>Remote Typing in:</h2>
                    <div className="countdown">
                        <div className="number">
                            <h2>10</h2>
                        </div>
                        
                        <div className="number">
                            <h2>9</h2>
                        </div>
                        
                        <div className="number">
                            <h2>8</h2>
                        </div>
                        
                        <div className="number">
                            <h2>7</h2>
                        </div>
                        
                        <div className="number">
                            <h2>6</h2>
                        </div>
                        
                        <div className="number">
                            <h2>5</h2>
                        </div>
                        
                        <div className="number">
                            <h2>4</h2>
                        </div>
                        
                        <div className="number">
                            <h2>3</h2>
                        </div>
                        
                        <div className="number">
                            <h2>2</h2>
                        </div>
                        
                        <div className="number">
                            <h2>1</h2>
                        </div>
                    </div>
                    <button className="btn" title="Cancel remote typing" onClick={ ()=> cancelRemoteTypeText() }><FontAwesomeIcon icon={faPowerOff} /></button>
                </div>

                <div className="fields-content">
                    {
                        fields.map((item) => {
                            if (item.field_type == Invokes.fieldTypes.TEXT) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faFont} /> {item.field_title}</label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="text" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            () => {
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        } />
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.PASSWORD) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faKey} /> {item.field_title}</label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="password" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            () => {
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        } />
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Toggle password" onClick={ () => {
                                                document.getElementById(item.field_id).type = (document.getElementById(item.field_id).type == "password" ? "text" : "password");
                                                setLastSelectedFieldId(-1);
                                            } }><FontAwesomeIcon icon={faEyeSlash} /></button>
                                            <button className="btn" title="Copy to clipboard" onClick={ () => {
                                                Invokes.clipboardCopy(document.getElementById(item.field_id).value);
                                                setLastSelectedFieldId(-1);
                                            }
                                            }><FontAwesomeIcon icon={faCopy} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                            <button className="btn" title="Generate secure password" onClick={ () => {
                                                Invokes.securePasswordGenerator().then((password) => {
                                                    document.getElementById(item.field_id).value = password;
                                                    Invokes.updateFieldValue(parseInt(sectionId), item.field_id, password);
                                                    fields.find((field) => field.field_id == item.field_id).field_value = password;
                                                    setLastSelectedFieldId(-1);
                                                });
                                            } }><FontAwesomeIcon icon={faKey} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.TWO_FACTOR) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faFingerprint} /> {item.field_title} <button className="btn" onClick={ () => {
                                            Invokes.generateFactorToken(parseInt(sectionId), item.field_id)
                                            .then(token => {
                                                if (token.length === 6) {
                                                    token = token.slice(0, 3) + " " + token.slice(3);
                                                }
                                                customInputLoad(item.field_id, token);
                                            })
                                            .catch(error => {
                                                console.error("Error generating factor token:", error);
                                                customInputLoad(item.field_id, ""); // Fallback
                                            });
                                        } }><FontAwesomeIcon icon={faArrowsRotate}/></button></label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="password" name={'passmer' + random} autoComplete={'passmer' + random} />
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title); setShow2FASetup(true) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Toggle 2FA Code" onClick={ () => {
                                                document.getElementById(item.field_id).type = (document.getElementById(item.field_id).type == "password" ? "text" : "password");
                                                setLastSelectedFieldId(-1);
                                            } }><FontAwesomeIcon icon={faEyeSlash} /></button>
                                            <button className="btn" title="Copy to clipboard" onClick={ () => {
                                                Invokes.clipboardCopy(document.getElementById(item.field_id).value.replace(" ", ""));
                                                setLastSelectedFieldId(-1);
                                            }
                                            }><FontAwesomeIcon icon={faCopy} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.DATE) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faCalendar} /> {item.field_title}</label>
                                        <Flatpickr
                                            className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} name={'passmer' + random} autoComplete={'passmer' + random}
                                            onChange={
                                                () => {
                                                    // Save in database
                                                    Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                    // Also save in local memory without re-rendering
                                                    fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                                }
                                            }
                                            options={{
                                                dateFormat: 'Y-m-d', // Format: Year-Month-Day
                                            }}
                                        />
                                        {setDatePickr(item.field_id, item.field_value)}
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.TIME) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faClock} /> {item.field_title}</label>
                                        <Flatpickr
                                            className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} name={'passmer' + random} autoComplete={'passmer' + random}
                                            onChange={
                                                () => {
                                                    // Save in database
                                                    Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                    // Also save in local memory without re-rendering
                                                    fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                                }
                                            }
                                            options={{
                                                enableTime: true,
                                                noCalendar: true,
                                                timeFormat: 'H:i',
                                                time_24hr: true,
                                            }}
                                        />
                                        {setDatePickr(item.field_id, item.field_value)}
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.DATETIME) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faBusinessTime} /> {item.field_title}</label>
                                        <Flatpickr
                                            className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} name={'passmer' + random} autoComplete={'passmer' + random}
                                            onChange={
                                                () => {
                                                    // Save in database
                                                    Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                    // Also save in local memory without re-rendering
                                                    fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                                }
                                            }
                                            options={{
                                                enableTime: true,
                                                dateFormat: 'Y-m-d H:i',
                                                timeFormat: 'H:i',
                                                time_24hr: true,
                                            }}
                                        />
                                        {setDatePickr(item.field_id, item.field_value)}
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.PHONE) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faPhone} /> {item.field_title}</label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="text" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            (e) => {
                                                e.target.value = e.target.value.replace(/[^0-9+\-()\s]/g, "");
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        } />
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.NUMBER) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faHashtag} /> {item.field_title}</label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="number" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            (e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        } />
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.URL) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faLink} /> {item.field_title} <button className="btn" onClick={ () => {
                                            Invokes.open(document.getElementById(item.field_id).value);
                                        } }><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></button></label>
                                        <input className={`field-input ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="text" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            () => {
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        } />
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.NOTES) {
                                return (
                                    <div className="field-text" key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <label className="field-label" htmlFor={item.field_id}><FontAwesomeIcon icon={faComment} /> {item.field_title}</label>
                                        <textarea className={`field-input textarea ${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} id={item.field_id} type="text" name={'passmer' + random} autoComplete={'passmer' + random} onChange={
                                            () => {
                                                // Save in database
                                                Invokes.updateFieldValue(parseInt(sectionId), item.field_id, document.getElementById(item.field_id).value);
                                                // Also save in local memory without re-rendering
                                                fields.find((field) => field.field_id == item.field_id).field_value = document.getElementById(item.field_id).value;
                                            }
                                        }></textarea>
                                        { customInputLoad(item.field_id, item.field_value) }
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                            <button className="btn" title="Type text after 5 seconds automatically" onClick={ 
                                                () => {
                                                    remoteTypeText(item.field_id);
                                                }
                                            }><FontAwesomeIcon icon={faKeyboard} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            else if (item.field_type == Invokes.fieldTypes.SPLIT) {
                                return (
                                    <div className="field-split" id={item.field_id} key={item.field_id} onContextMenu={ () => setLastSelectedFieldId(item.field_id)}>
                                        <FontAwesomeIcon className={`${(lastSelectedFieldId == item.field_id ? "hide" : "show")}`} icon={faParagraph} />
                                        <div className={`field-actions ${(lastSelectedFieldId == item.field_id ? "show" : "hide")}`}>
                                            <button className="btn" title="Close menu" onClick={ () => setLastSelectedFieldId(-1) }><FontAwesomeIcon icon={faRightLeft} /></button>
                                            <button className="btn" title="Swap left" onClick={ () => swapFieldItemsLeft(sectionId, item.field_id) }><FontAwesomeIcon icon={faLeftLong} /></button>
                                            <button className="btn" title="Swap right" onClick={ () => swapFieldItemsRight(sectionId, item.field_id) }><FontAwesomeIcon icon={faRightLong} /></button>
                                            <button className="btn" title="Options" onClick={ () => { setShowOptionFieldPopup(true); setNewFieldTitle(item.field_title) } }><FontAwesomeIcon icon={faGear} /></button>
                                            <button className="btn" title="Delete" onClick={ () => setShowDeleteFieldPopup(true) }><FontAwesomeIcon icon={faTrash} /></button>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    }
                    
                </div>
            </div>
        </div>
    );
}

export default Fields;
