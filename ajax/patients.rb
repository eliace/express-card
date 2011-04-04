

get '/patients' do
	
	query = params[:query]
	
	case query
		when 'all'
			Patient.all.to_json
	end
	
end



post '/patients/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	Patient.update id, json
	
	json
end


put '/patients' do	
	json = JSON.parse(params[:_serialized])
	Patient.create(json).to_json
end