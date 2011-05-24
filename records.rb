


class User < ActiveRecord::Base
end


class Patient < ActiveRecord::Base
	has_many :express_cards
end


class AnalysisGroup < ActiveRecord::Base
	has_many :analyses
end


class Analysis < ActiveRecord::Base
	belongs_to :analysis_group
end


class DrugUnit < ActiveRecord::Base
	
end

class DrugSolvent < ActiveRecord::Base
	
end

class DrugGroup < ActiveRecord::Base
#	belongs_to :drug_category
	has_many :drugs
	
	def as_json(o=nil)
		json = super(o).merge(:_class => self.class.name)
		json['drugs'] = drugs.as_json if not o.nil? and o[:with_drugs]
		json
	end
	
end

class Drug < ActiveRecord::Base
	belongs_to :drug_group
	belongs_to :drug_unit
	belongs_to :drug_solvent
	
	def as_json(o=nil)
		json = super(o).merge(:_class => self.class.name)
		json['effects'] = effects.nil? ? {} : JSON.parse(effects)
		json
	end
		
end

class ExpressCard < ActiveRecord::Base
	belongs_to :patient
	has_many :appointments, :class_name => 'ExpressCardAppointment', :foreign_key => 'express_card_id'
	has_many :analyses, :class_name => 'ExpressCardAnalysis', :foreign_key => 'express_card_id'
	
	def as_json(o=nil)
		json = super(o)
		json[:analyses] = []
		json[:appointments] = []
		if not o.nil? and o[:detailed] then
			analyses.each do |rec|
				json[:analyses] << {
					:id => rec.id,
					:analysis_name => rec.analysis.name,
					:interval => rec.interval,
					:from_date => rec.from_date
				}
			end
			appointments.each do |rec|
				json[:appointments] << {
					:id => rec.id,
					:drug_name => rec.drug.name,
					:drug_solvent_id => rec.drug_solvent_id,
					:drug_content => rec.drug_content,
					:drug_unit_id => rec.drug.drug_unit_id,
					:doses => JSON.parse(rec.doses),
					:weight_dose => rec.weight_dose,
					:base_dose => rec.base_dose
				}
			end
		end
		json
	end
	
end

class ExpressCardAnalysis < ActiveRecord::Base
	belongs_to :express_card
	belongs_to :analysis
end

class ExpressCardAppointment < ActiveRecord::Base
	belongs_to :express_card
	belongs_to :appointment_group
	belongs_to :drug
end

class AppointmentGroup < ActiveRecord::Base
#	has_many :drug_groups	
end
