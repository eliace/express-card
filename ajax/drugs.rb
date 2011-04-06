

get '/drug_units' do
	
	query = params[:query]
	
	case query
		when 'all'
			DrugUnit.all.to_json
	end
	
end


get '/drug_solvents' do
	
	query = params[:query]
	
	case query
		when 'all'
			DrugSolvent.all.to_json
	end
	
end


get '/drug_categories' do
	
	query = params[:query]
	
	case query
		when 'all'
			DrugCategory.all.to_json
	end
	
end



get '/drug_groups' do
	
	query = params[:query]
	
	case query
		when 'all'
			DrugGroup.all.to_json
	end
	
	
end




get '/drugs' do
	
	query = params[:query]
	
	case query
		when 'all'
			Drug.all.to_json
	end
	
	
end


put '/drugs' do
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	Drug.create(json).to_json
	
end


post '/drugs/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	Drug.update(id, json)
	
	JSON.generate json
end


delete '/drugs/:id' do |id|
	Drug.delete id
end


