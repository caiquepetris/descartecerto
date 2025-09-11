
  (() => {

    const FACTORS = {
      PET_KG_PER_UNIT: 0.025,   
      CAN_KG_PER_UNIT: 0.0145, 
      PAPER_CO2_PER_KG: 1.5     
    }; 
    const $pet = document.getElementById('qtdPet');
    const $lata = document.getElementById('qtdLata');
    const $papel = document.getElementById('kgPapel');

    const $kgPlastico = document.getElementById('kgPlastico');
    const $kgAluminio = document.getElementById('kgAluminio');
    const $kgCO2 = document.getElementById('kgCO2');

    // Sanitização simples para evitar Numérps / negativos
    function parseNonNeg(v){
      const n = Number(v);
      return isFinite(n) && n > 0 ? n : 0;
    }

    function fmt(n){
      // 0 a 9,99 => 2 casas; >=10 => 1 casa; inteiro => sem casas
      if (n === 0) return '0';
      if (Number.isInteger(n)) return String(n);
      return (n >= 10) ? n.toFixed(1) : n.toFixed(2);
    }

    function recompute(){
      const qtdPet = parseNonNeg($pet.value);
      const qtdLata = parseNonNeg($lata.value);
      const kgPapel = parseNonNeg($papel.value);

      const kgPlastico = qtdPet * FACTORS.PET_KG_PER_UNIT;
      const kgAluminio = qtdLata * FACTORS.CAN_KG_PER_UNIT;
      const kgCO2 = kgPapel * FACTORS.PAPER_CO2_PER_KG;

      $kgPlastico.textContent = fmt(kgPlastico);
      $kgAluminio.textContent = fmt(kgAluminio);
      $kgCO2.textContent = fmt(kgCO2);
    }

    
    [$pet, $lata, $papel].forEach(el => {
      el.addEventListener('input', recompute, { passive: true });
      el.addEventListener('change', recompute, { passive: true });
    });

    
    recompute();
  })();
