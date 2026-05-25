update payments
set
  expected_amount = case installment_no
    when 1 then 10000
    when 2 then 8535
    when 3 then 8620
    when 4 then 8705
    when 5 then 8790
    when 6 then 8875
    when 7 then 8960
    when 8 then 9045
    when 9 then 9130
    when 10 then 9215
    when 11 then 9295
    when 12 then 9375
    when 13 then 9455
    when 14 then 9535
    when 15 then 9615
    when 16 then 9695
    when 17 then 9775
    when 18 then 9850
    when 19 then 9925
    when 20 then 7900
    else expected_amount
  end,
  maturity_amount = case installment_no
    when 1 then 163000
    when 2 then 164700
    when 3 then 166400
    when 4 then 168100
    when 5 then 169800
    when 6 then 171500
    when 7 then 173200
    when 8 then 174900
    when 9 then 176600
    when 10 then 178300
    when 11 then 179900
    when 12 then 181500
    when 13 then 183100
    when 14 then 184700
    when 15 then 186300
    when 16 then 187900
    when 17 then 189500
    when 18 then 191000
    when 19 then 192500
    when 20 then 194000
    else maturity_amount
  end
from chits
where payments.chit_id = chits.id
  and chits.type = 'TWO_LAKH';
