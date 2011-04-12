





get '/express_card_analyses' do
	
	query = params[:query]
	
	case query
		when 'express_card'
			ExpressCardAnalyses.where(:express_card_id => params[:express_card_id]).to_json
	end
	
end


put '/express_card_analyses' do
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	ExpressCardAnalysis.create(json).to_json
	
end


post '/express_card_analyses/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	ExpressCardAnalysis.update(id, json)
	
	JSON.generate json
end


delete '/express_card_analyses/:id' do |id|
	ExpressCardAnalysis.delete id
end







get '/appointment_groups' do
	
	query = params[:query]
	
	case query
		when 'all'
			AppointmentGroup.all.to_json
	end
	
end
