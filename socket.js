const { getDB } = require('./config/db');
const cellsBeingEditted = {}
const db = getDB();

module.exports = (io) => {

    io.on('connection', socket => {
        console.log('connected');
        const { company_id } = socket.handshake.query;
        socket.join(company_id);
        
        if(!cellsBeingEditted[company_id]) cellsBeingEditted[company_id] = []
        socket.emit('init', cellsBeingEditted[company_id])

        socket.on('startEditing', (data, user) => {
            if(user){
                cellsBeingEditted[company_id] = cellsBeingEditted[company_id].filter(item => item.user !== user.user_email)
                cellsBeingEditted[company_id].push({id: data.id, color: randomHex(user.user_email), user: user.user_email, field: data.field})
                io.to(company_id).emit('startEditing', cellsBeingEditted[company_id]);
            }
        });

        socket.on('stopEditing', (data, user) => {
            if(user){
                cellsBeingEditted[company_id] = cellsBeingEditted[company_id].filter(item => item.id !== user.user_email)
                io.to(company_id).emit('stopEditing', cellsBeingEditted[company_id]);
            }
        });


        socket.on('cellChangeCommit', (data) => cellChangeCommit(data, io, company_id))

		socket.on('disconnect', (user) => {
            cellsBeingEditted[company_id] = cellsBeingEditted[company_id].filter(cell => cell.socket_id !== user.user_email)
            io.to(company_id).emit('stopEditing', cellsBeingEditted[company_id])
            console.log('disconnected')
        }); 

    })
    
}

function randomHSL(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    const s = 50 + Math.abs(hash % 20);
    const l = 50 + Math.abs(hash % 20);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

function randomHex(email){
    // extract the last number of email address
    let num = parseInt(email.slice(email.indexOf('@') - 2, email.indexOf('@') - 1).charCodeAt())
    let index = num % 22;
    num = num % 10;
    num = num * 100
    // get the color name
    let colors = [
      "Slate",
      "Gray",
      "Zinc",
      "Neutral",
      "Stone",
      "Red",
      "Orange",
      "Amber",
      "Yellow",
      "Lime",
      "Green",
      "Emerald",
      "Cyan",
      "Teal",
      "Sky",
      "Blue",
      "Indigo",
      "Violet",
      "Purple",
      "Fucshia",
      "Pink",
      "Rose",
    ];
    // return the color
    let color = colors[index % 22].toLowerCase()
    return `${color}-${num}`;
}

const cellChangeCommit = (data, io, company_id) => {
    try{
        if(data.params.id){
            db.collection('documents').doc(data.params.id).get().then(doc => {
                if(doc.exists) {
                    const newData = {...doc.data(), document_id: doc.id}
                    let changed = ''
                    for(let i = 0; i < Object.keys(data.params).length; i++){
                        if( data.params[Object.keys(data.params)[i]] !== data.old[Object.keys(data.old)[i]] ){
                            changed = Object.keys(data.params)[i]
                        }
                    }
                    switch(changed){
                        case 'v_stock_no': newData.data.vehicle.v_stock_no = data.params[changed]; break;
                        case 'v_vehicle': newData.data.vehicle.v_vehicle = data.params[changed]; break;
                        case 'v_vin_no': newData.data.vehicle.v_vin_no = data.params[changed]; break;
                        case 'v_is_certified': newData.data.vehicle.v_is_certified = data.params[changed].toUpperCase() === 'Y' ? true : false; break;
                        case 'v_margin': newData.data.vehicle.v_margin = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_margin : parseInt(data.params[changed]); break;
                        case 'v_days': newData.data.vehicle.v_days = (isNaN(parseInt(data.params[changed])) || parseInt(data.params[changed]) < 0) ? newData.data.vehicle.v_days : parseInt(data.params[changed]); break;
                        case 'v_source': newData.data.vehicle.v_source = data.params[changed]; break;
                        case 'v_initial_mmr': newData.data.vehicle.v_initial_mmr = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_initial_mmr : parseInt(data.params[changed]); break;
                        case 'v_final_mmr': newData.data.vehicle.v_final_mmr = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_final_mmr : parseInt(data.params[changed]); break;
                        case 'v_initial_carg_h': newData.data.vehicle.v_initial_carg_h = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_initial_carg_h : parseInt(data.params[changed]); break;
                        case 'v_final_carg_h': newData.data.vehicle.v_final_carg_h = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_final_carg_h : parseInt(data.params[changed]); break;
                        case 'v_start_price': newData.data.vehicle.v_start_price = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_start_price : parseInt(data.params[changed]); break;
                        case 'v_sell_price': newData.data.vehicle.v_sell_price = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_sell_price : parseInt(data.params[changed]); break;
                        case 'v_market_percent': newData.data.vehicle.v_market_percent = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_market_percent : parseInt(data.params[changed]); break;
                        case 'v_trade': 
                            newData.data.trade.t_vehicle = data.params[changed]; 
                            newData.data.vehicle.v_is_trade = (data.params[changed] && data.params[changed].length > 0) ? true : false;
                            break;
                        case 'date': newData.metadata.created_at = isNaN(Date.parse(data.params[changed])) ? newData.metadata.created_at : new Date(data.params[changed]).toLocaleDateString('en-US'); break;
                        case 'notes': newData.notes = data.params[changed]; break;
                        case 'v_acv': newData.data.vehicle.v_acv = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_acv : parseInt(data.params[changed]); break;
                        case 't_vin_no': newData.data.trade.t_vin_no = data.params[changed]; break;
                        case 'v_sales_mgr': newData.data.v_sales_mgr = data.params[changed]; break;
                        case 'v_customer': newData.data.v_customer = data.params[changed]; break;
                        case 'v_miles': newData.data.vehicle.v_miles = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_miles : parseInt(data.params[changed]); break;
                        case 'rollback': newData.rollback = data.params[changed]; break;
                        
                    }
                    db.collection('documents').doc(data.params.id).set(newData).then(() => {
                        io.to(company_id).emit('cellChangeCommit', {
                            ...newData.data?.vehicle,
                            ...newData.data?.trade,
                            v_is_certified: newData.data?.vehicle?.v_is_certified ? 'Y' : 'N',
                            t_vehicle: newData.data?.trade?.t_vehicle || '',
                            v_vehicle: newData.data?.vehicle?.v_vehicle ? `${newData.data?.vehicle?.v_vehicle}` : `${newData.data?.vehicle?.v_year || ''} ${newData.data?.vehicle?.v_make || ''} ${newData.data?.vehicle?.v_model || ''} ${newData.data?.vehicle?.v_package || ''}`,
                            v_market_percent: newData.data?.vehicle?.v_market_percent || '',
                            v_sell_price: newData.data?.vehicle?.v_sell_price || '',
                            v_start_price: newData.data?.vehicle?.v_start_price || '',
                            v_final_carg_h: newData.data?.vehicle?.v_final_carg_h || '',
                            v_initial_carg_h: newData.data?.vehicle?.v_initial_carg_h || '',
                            v_final_mmr: newData.data?.vehicle?.v_final_mmr || '',
                            v_initial_mmr: newData.data?.vehicle?.v_initial_mmr || '',
                            v_source: newData.data?.vehicle?.v_source || '',
                            v_days: newData.data?.vehicle?.v_days || '',
                            v_margin: newData.data?.vehicle?.v_margin || '',
                            v_vin_no: newData.data?.vehicle?.v_vin_no || '',
                            v_stock_no: newData.data?.vehicle?.v_stock_no || '',
                            created_at: new Date(newData.metadata.created_at).toLocaleDateString('en-US'),
                            document_id: newData.document_id,
                            notes: newData.notes || '',
                            v_acv: newData.data?.vehicle?.v_acv || '0',
                            t_vin_no: newData.data?.trade?.t_vin_no || '',
                            v_sales_mgr: newData.data?.v_sales_mgr || '',
                            v_customer: newData.data?.v_customer || '',
                            v_miles: newData.data?.vehicle?.v_miles || '0',
                            rollback: newData?.rollback || '',
                        });

                    })
                }
            })
        }
        else{
            insertNew(data, company_id, io)
        }
    }catch(e){
        console.log(e)
    }
}

const insertNew = (data, company_id, io) => { 
    data = data.params
    const db = getDB();
    if(Object.keys(data).some(key => data[key] === '')){
        let constructedObject = {
            data:{
                vehicle: {
                    v_vehicle: data.v_vehicle || '',
                    v_vin_no: data.v_vin_no || '',
                    v_stock_no: data.v_stock_no || '',
                    v_source: data.v_source || '',
                    v_initial_mmr: data.v_initial_mmr || '',
                    v_final_mmr: data.v_final_mmr || '',
                    v_initial_carg_h: data.v_initial_carg_h || '',
                    v_final_carg_h: data.v_final_carg_h || '',
                    v_start_price: data.v_start_price || '',
                    v_sell_price: data.v_sell_price || '',
                    v_market_percent: data.v_market_percent || '',
                    v_days: data.v_days || '',
                    v_margin: data.v_margin || '',
                    v_is_certified: data.v_is_certified?.toUpperCase() === 'Y' ? true : false || 'N',
                    v_customer: data.v_customer || '',
                    v_sales_mgr: data.v_sales_mgr || '',
                    v_acv: data.v_acv || '',
                    v_miles: isNaN(parseInt(data.v_miles)) ? 0 : parseInt(data.v_miles),
                },
                trade: {
                    t_vehicle: data.v_trade || '',
                },
                document_type: 'Trip Pad'
            },
            metadata: {
                created_at: new Date().toLocaleDateString('en-US'),
            },
            notes: data.notes || data.notes || '',
            company_id: company_id,
        }

        db.collection('documents').add(constructedObject).then((docRef) => {
            constructedObject.document_id = docRef.id
            docRef.get().then((doc) => {
                console.log(doc.data())
                io.to(company_id).emit('cellChangeCommit', {
                    ...doc.data().data?.vehicle,
                    ...doc.data().data?.trade,
                    v_is_certified: doc.data().data?.vehicle?.v_is_certified ? 'Y' : 'N',
                    t_vehicle: doc.data().data?.trade?.t_vehicle || '',
                    v_vehicle: doc.data().data?.vehicle?.v_vehicle || '',
                    v_market_percent: doc.data().data?.vehicle?.v_market_percent || '',
                    v_sell_price: doc.data().data?.vehicle?.v_sell_price || '',
                    v_start_price: doc.data().data?.vehicle?.v_start_price || '',
                    v_final_carg_h: doc.data().data?.vehicle?.v_final_carg_h || '',
                    v_initial_carg_h: doc.data().data?.vehicle?.v_initial_carg_h || '',
                    v_final_mmr: doc.data().data?.vehicle?.v_final_mmr || '',
                    v_initial_mmr: doc.data().data?.vehicle?.v_initial_mmr || '',
                    v_source: doc.data().data?.vehicle?.v_source || '',
                    v_days: doc.data().data?.vehicle?.v_days || '',
                    v_margin: doc.data().data?.vehicle?.v_margin || '',
                    v_vin_no: doc.data().data?.vehicle?.v_vin_no || '',
                    v_stock_no: doc.data().data?.vehicle?.v_stock_no || '',
                    created_at: new Date(doc.data().metadata.created_at).toLocaleDateString('en-US'),
                    document_id: docRef.id,
                    notes: doc.data().notes || '',
                    v_acv: doc.data().data?.vehicle?.v_acv || '',
                    t_vin_no: doc.data().data?.trade?.t_vin_no || '',
                    v_sales_mgr: doc.data().data?.v_sales_mgr || '',
                    v_customer: doc.data().data?.v_customer || '',
                    v_miles: doc.data().data?.vehicle?.v_miles || '',
                }, true);
            })
        
        })
    }
}