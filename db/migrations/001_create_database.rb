require 'foreigner'
require 'digest/sha2'

class CreateDatabase < ActiveRecord::Migration
  
  class User < ActiveRecord::Base
  end
  class Patient < ActiveRecord::Base
  end
  class AnalysisGroup < ActiveRecord::Base
  end
  class DrugSolvent < ActiveRecord::Base
  end
#  class DrugEffect < ActiveRecord::Base
#  end
  class DrugUnit < ActiveRecord::Base
  end
  class DrugGroup < ActiveRecord::Base
  end
  class DrugCategory < ActiveRecord::Base
  end
  class AppointmentGroup < ActiveRecord::Base
  end
  
  def self.up
    
    # Пользователи
    create_table :users do |t|
      t.string :first_name
      t.string :middle_name
      t.string :last_name
      t.string :display_name
      t.string :login
      t.string :password
    end   
    
    # Пациенты
    create_table :patients do |t|
      t.string :name                            		# имя пациента
      t.integer :patient_no                    		# номер пациента
      t.text :diagnosis                        		# диагноз
      t.string :sex                             		# пол (male|female)
      t.date :birth_date                       		# дата рождения
      t.date :admission_date              				# дата поступления
      t.float :birth_weight												# вес при рождении
      t.float :admission_weight										# вес при поступлении
      t.float :weight															# текущий вес
      t.boolean :dismissed, :default => false		# выписан (aka удален)
    end
    
#		# Учитываемые эффекты препаратов
#		create_table :drug_effects do |t|
#      t.float :proteins
#      t.float :fats
#      t.float :carbohydrates
#      t.float :calories
#		end

		# Растворители
		create_table :drug_solvents do |t|
			t.string :name
			t.text :effects
		end

#    add_foreign_key(:drug_solvents, :drug_effects)

    # Категории препаратов (препараты, питание и др.)
    create_table :drug_categories do |t|
      t.string :name
    end

    # Группы препаратов
    create_table :drug_groups do |t|
      t.string :name
      t.integer :parent_id
      t.references :drug_category
    end

    add_foreign_key(:drug_groups, :drug_categories)


    # Единицы измерения препаратов
    create_table :drug_units do |t|
      t.string :name
    end

		# Препараты (препараты, питание)
    create_table :drugs do |t|
      t.string :name																# наименование
#      t.references :drug_category									# категория
      t.references :drug_group											# группа
#			t.references :drug_effect										# эффект (калорийность, электролиты и др.)
			t.references :drug_unit											# единицы измерения 
      t.references :drug_solvent										# раствор
			t.float :content															# содержание в растворе
			t.text :effects
		end
  
#    add_foreign_key(:drugs, :drug_categories)
    add_foreign_key(:drugs, :drug_groups)
    add_foreign_key(:drugs, :drug_solvents)
#    add_foreign_key(:drugs, :drug_effects)
    add_foreign_key(:drugs, :drug_units)
  

		# группы анализов
    create_table :analysis_groups do |t|
      t.string :name
      t.integer :parent_id
    end

		# анализы
    create_table :analyses do |t|
      t.string :name
      t.references :analysis_group
    end

    add_foreign_key(:analyses, :analysis_groups)



		create_table :express_cards do |t|
			t.references :patient														# пациент
			t.float :calc_weight															# расчетный вес
		end


		create_table :express_card_analyses do |t|
			t.references :express_card
			t.references :analysis
			t.integer :interval
			t.date :from_date
		end

    add_foreign_key(:express_card_analyses, :express_cards)
    add_foreign_key(:express_card_analyses, :analyses)



    create_table :appointment_groups do |t|
      t.string :name
    end

		create_table :express_card_appointments do |t|
			t.references :express_card
			t.references :drug
			t.references :appointment_group
		end

    add_foreign_key(:express_card_appointments, :express_cards)
    add_foreign_key(:express_card_appointments, :drugs)
    add_foreign_key(:express_card_appointments, :appointment_groups)


		#
		# Заполняем базу данных тестовыми данными
		#
		d = Digest::SHA2.new
		User.create(:display_name => 'Администратор', :login => 'admin', :password => d.hexdigest('123456'))
		
		Patient.create(:name => 'Вася', :patient_no => 1, :diagnosis => 'Воспаление межушного ганглия');
		
		AnalysisGroup.create(:name => '');
		AnalysisGroup.create(:name => 'Клинический');
		AnalysisGroup.create(:name => 'Биохимический');
		AnalysisGroup.create(:name => 'Бактериологический');
		
		DrugUnit.create(:name => 'г');
		DrugUnit.create(:name => 'мг');
		DrugUnit.create(:name => 'мкг');
		DrugUnit.create(:name => 'мл');
		DrugUnit.create(:name => 'ммоль');
		DrugUnit.create(:name => 'ЕД');
    
    DrugSolvent.create(:name => 'вода');
    DrugSolvent.create(:name => 'глюкоза');
    DrugSolvent.create(:name => 'NaCl');
    
    DrugGroup.create(:name => '');
    DrugGroup.create(:name => 'Питание');
    DrugGroup.create(:name => 'Диуретики');
    DrugGroup.create(:name => 'Противосудорожные');
    DrugGroup.create(:name => 'Антибиотики');

    AppointmentGroup.create(:name => '');
    AppointmentGroup.create(:name => 'Энтерально');
    AppointmentGroup.create(:name => 'В/в струйно');
    AppointmentGroup.create(:name => 'В/в капельно');
    AppointmentGroup.create(:name => 'Внутримышечно');
    
#    DrugGroup.create();
    
    
  end
  
  def self.down

    drop_table :express_card_analyses
    drop_table :express_card_appointments

		drop_table :express_cards

    drop_table :drugs
    drop_table :drug_groups
    drop_table :drug_units
    drop_table :drug_categories
    drop_table :drug_solvents
#    drop_table :drug_effects
    drop_table :analyses
    drop_table :analysis_groups

    drop_table :appointment_groups

#    drop_table :appointments

    drop_table :users
    drop_table :patients
    
  end
  
  
end
