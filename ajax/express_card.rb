





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








get '/express_cards' do
	
	query = params[:query]
	
	case query
		when 'today'
			# получаем пациента
			patient = Patient.find(params[:patient_id])
			# проверяем, есть ли сегодняшняя экспресс-карта
			rec = ExpressCard.find_by_patient_id_and_creation_date(patient.id, Date.today)
			
			# если карта на сегодня есть, то возвращаем ее
			return rec.to_json(:detailed => true) if not rec.nil?


			json = {
				:analyses => [],
				:appointments => [],
				:creation_date => Date.today,
				:patient_id => patient.id
			}

			# если карты на сегодня нет, то ищем последнюю
			rec = ExpressCard.where(:patient_id => patient.id).order(:creation_date).last
						
			if rec.nil? then
				# если последняя карта не определена, то берем данные пациента
				json[:weight] = patient.admission_weight
				json[:calc_weight] = patient.admission_weight
			else
				# если последняя карта определена, то используем ее параметры
				json[:weight] = rec.calc_weight
				json[:calc_weight] = rec.calc_weight
			end
			
			JSON.generate(json)

	end
		
		
	
	
end



post '/express_cards/:id' do |id|

	json = JSON.parse(params[:_serialized])
	
	attrs = json.filter(['calc_weight'])
	ExpressCard.update(id, attrs)
	

	# обновляем список анализов
	json['analyses'].each do |analysis|
		attrs = analysis.filter(['analysis_id', 'interval', 'from_date'])
		attrs[:express_card_id] = id

		rec = ExpressCardAnalysis.find(analysis['id'])
		
		if rec.nil? then
			rec = ExpressCardAnalysis.new
		end
		
		rec.attributes = attrs
		
		rec.save
	end
	
	# обновляем список назначений
	json['appointments'].each do |appointment|
		attrs = appointment.filter(['drug_id', 'drug_solvent_id', 'drug_content', 'doses', 'base_dose', 'weight_dose'])
		attrs[:express_card_id] = id
		attrs[:doses] = JSON.generate(attrs[:doses])

		rec = appointment['id'] ? ExpressCardAppointment.find(appointment['id']) : ExpressCardAppointment.new
		
		rec.attributes = attrs
		
		rec.save
	end
	
	ExpressCard.find(id).to_json
end


put '/express_cards' do
	
	json = JSON.parse(params[:_serialized])
	
	attrs = {
		:patient_id => json['patient_id'],
		:calc_weight => json['calc_weight'],
		:creation_date => Date.today
	}
	
	
	# начинается транзакция
	ActiveRecord::Base.transaction do
	
		rec = ExpressCard.create(attrs);
		
		json['analyses'].each do |analysis|
			attrs = analysis.filter(['analysis_id', 'interval', 'from_date'])
			attrs[:express_card_id] = rec.id
			ExpressCardAnalysis.create(attrs)
		end
		
		json['appointments'].each do |appointment|
			attrs = appointment.filter(['drug_id', 'doses', 'base_dose', 'weight_dose', 'drug_solvent_id', 'drug_content'])
			attrs[:express_card_id] = rec.id
			attrs[:doses] = JSON.generate(attrs[:doses])
			ExpressCardAppointment.create(attrs)
		end
	
		rec.to_json	
	end
	
end





