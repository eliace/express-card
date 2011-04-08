



get '/analysis_groups' do
	
	query = params[:query]
	
	case query
		when 'all'
			AnalysisGroup.all.to_json
	end
	
	
end






get '/analyses' do
	
	query = params[:query]
	
	case query
		when 'all'
			Analysis.all.to_json
		when 'classification'
			arr = AnalysisGroup.all.as_json(:include => :analyses)
			arr << arr.shift  # фикс для того, чтобы группа "другие" оказалась в конце
			JSON.generate arr
	end
	
end


put '/analyses' do
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	Analysis.create(json).to_json
	
end


post '/analyses/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	
	Analysis.update(id, json)
	
	JSON.generate json
end


delete '/analyses/:id' do |id|
	Analysis.delete id
end