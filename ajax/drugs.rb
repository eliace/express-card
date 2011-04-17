

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
		when 'classification'
			arr = DrugGroup.all.as_json(:include => :drugs)
			arr << arr.shift  # фикс для того, чтобы группа "другие" оказалась в конце
			JSON.generate arr
	end
	
	
end


put '/drugs' do
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	json['effects'] = JSON.generate(json['effects']) if not json['effects'].nil?
	
	Drug.create(json).to_json
	
end


post '/drugs/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей

	json['effects'] = JSON.generate(json['effects']) if not json['effects'].nil?	
	
	Drug.update(id, json)
	
	Drug.find(id).to_json
end


delete '/drugs/:id' do |id|
	Drug.delete id
end


