



get '/analysis_groups' do
	
	query = params[:query]
	
	case query
		when 'all'
			AnalysisGroup.all.to_json
	end
	
	
end