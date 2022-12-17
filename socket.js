const { getDB } = require('./config/db');

module.exports = (io) => {
    const db = getDB();
    const cellsBeingEditted = {}

    io.on('connection', socket => {
        console.log('connected');
        const { company_id } = socket.handshake.query;
        socket.join(company_id);
        
        if(!cellsBeingEditted[company_id]) cellsBeingEditted[company_id] = []
        setTimeout(() => socket.emit('init', cellsBeingEditted[company_id]), 500)

        socket.on('startEditing', (data, color) => {
            cellsBeingEditted[company_id].push(data)
            io.to(company_id).emit('startEditing', cellsBeingEditted[company_id], color || '#ffb800');
        });

        socket.on('stopEditing', (data) => {
            cellsBeingEditted[company_id] = cellsBeingEditted[company_id].filter(item => item.id !== data.id)
            io.to(company_id).emit('stopEditing', cellsBeingEditted[company_id]);
        });

        socket.on('cellChangeCommit', (data) => {
            try{
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
                            case 'col1': newData.data.vehicle.v_stock_no = data.params[changed]; break;
                            case 'col2': newData.data.vehicle.v_vehicle = data.params[changed]; break;
                            case 'col3': newData.data.vehicle.v_vin_no = data.params[changed]; break;
                            case 'col4': newData.data.vehicle.v_is_certified = data.params[changed] === 'Y' ? 'N' : 'Y'; break;
                            case 'col5': newData.data.vehicle.v_margin = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_margin : parseInt(data.params[changed]); break;
                            case 'col6': newData.data.vehicle.v_days = !(isNaN(parseInt(data.params[changed]) && parseInt(data.params[changed]) >= 0)) ? newData.data.vehicle.v_days : parseInt(data.params[changed]); break;
                            case 'col7': newData.data.vehicle.v_source = data.params[changed]; break;
                            case 'col8': newData.data.vehicle.v_initial_mmr = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_initial_mmr : parseInt(data.params[changed]); break;
                            case 'col9': newData.data.vehicle.v_final_mmr = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_final_mmr : parseInt(data.params[changed]); break;
                            case 'col10': newData.data.vehicle.v_initial_carg_h = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_initial_carg_h : parseInt(data.params[changed]); break;
                            case 'col11': newData.data.vehicle.v_final_carg_h = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_final_carg_h : parseInt(data.params[changed]); break;
                            case 'col12': newData.data.vehicle.v_start_price = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_start_price : parseInt(data.params[changed]); break;
                            case 'col13': newData.data.vehicle.v_sell_price = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_sell_price : parseInt(data.params[changed]); break;
                            case 'col14': newData.data.vehicle.v_market_percent = isNaN(parseInt(data.params[changed])) ? newData.data.vehicle.v_market_percent : parseInt(data.params[changed]); break;
                            case 'col15': newData.data.trade.t_vehicle = data.params[changed]; break;
                            case 'col16': newData.metadata.created_at = isNaN(Date.parse(data.params[changed])) ? newData.metadata.created_at : new Date(data.params[changed]).toLocaleDateString('en-US'); break;
                            case 'col17': newData.notes = data.params[changed]; break;
                        }
                        db.collection('documents').doc(data.params.id).set(newData).then(() => {
                            io.to(company_id).emit('cellChangeCommit', {
                                ...newData.data?.vehicle,
                                ...newData.data?.trade,
                                v_is_certified: newData.data?.vehicle?.v_is_certified ? 'Y' : 'N',
                                t_vehicle: newData.data?.trade?.t_vehicle || '',
                                v_vehicle: newData.data?.vehicle?.v_vehicle || '',
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
                            });
                        })
                    }
                })
            }catch(e){
                console.log(e)
            }
        })
		socket.on('disconnect', () => console.log('disconnected')); 

    })
    
}