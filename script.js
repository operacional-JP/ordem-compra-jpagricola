document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pedidoForm');
    const itensTable = document.getElementById('itensTable').getElementsByTagName('tbody')[0];
    const adicionarItemBtn = document.getElementById('adicionarItem');
    const gerarPDFBtn = document.getElementById('gerarPDF');
    const totalGeralElement = document.getElementById('totalGeral');
    
    // Elementos do fornecedor para salvar no localStorage
    const fornecedorRazaoSocial = document.getElementById('fornecedorRazaoSocial');
    const fornecedorCpfCnpj = document.getElementById('fornecedorCpfCnpj');
    const fornecedorEmail = document.getElementById('fornecedorEmail');
    const fornecedorTelefone = document.getElementById('fornecedorTelefone');
    const fornecedorEndereco = document.getElementById('fornecedorEndereco');
    
    let totalGeral = 0;
    
    // Carregar dados do fornecedor do localStorage
    function carregarDadosFornecedor() {
        const dadosSalvos = localStorage.getItem('dadosFornecedorJPAgricola');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            fornecedorRazaoSocial.value = dados.razaoSocial || '';
            fornecedorCpfCnpj.value = dados.cpfCnpj || '';
            fornecedorEmail.value = dados.email || '';
            fornecedorTelefone.value = dados.telefone || '';
            fornecedorEndereco.value = dados.endereco || '';
        }
    }
    
    // Salvar dados do fornecedor no localStorage
    function salvarDadosFornecedor() {
        const dados = {
            razaoSocial: fornecedorRazaoSocial.value,
            cpfCnpj: fornecedorCpfCnpj.value,
            email: fornecedorEmail.value,
            telefone: fornecedorTelefone.value,
            endereco: fornecedorEndereco.value
        };
        localStorage.setItem('dadosFornecedorJPAgricola', JSON.stringify(dados));
    }
    
    // Adicionar evento para salvar quando os campos mudarem
    [fornecedorRazaoSocial, fornecedorCpfCnpj, fornecedorEmail, fornecedorTelefone, fornecedorEndereco].forEach(input => {
        input.addEventListener('change', salvarDadosFornecedor);
    });
    
    // Carregar dados ao iniciar
    carregarDadosFornecedor();
    
    // Adicionar linha de item
    adicionarItemBtn.addEventListener('click', function() {
        if (itensTable.rows.length >= 15) {
            alert('Máximo de 15 itens atingido.');
            return;
        }
        
        const row = itensTable.insertRow();
        
        // Quantidade
        const cellQuantidade = row.insertCell(0);
        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.min = '1';
        inputQuantidade.value = '1';
        inputQuantidade.className = 'quantidade-input';
        cellQuantidade.appendChild(inputQuantidade);
        
        // Descrição
        const cellDescricao = row.insertCell(1);
        const inputDescricao = document.createElement('input');
        inputDescricao.type = 'text';
        inputDescricao.className = 'descricao-input';
        inputDescricao.required = true;
        cellDescricao.appendChild(inputDescricao);
        
        // Valor Unitário
        const cellValorUnitario = row.insertCell(2);
        const inputValorUnitario = document.createElement('input');
        inputValorUnitario.type = 'text';
        inputValorUnitario.className = 'valor-input';
        inputValorUnitario.placeholder = 'R$ 0,00';
        inputValorUnitario.addEventListener('focus', function() {
            if (this.value === '') this.value = 'R$ ';
        });
        cellValorUnitario.appendChild(inputValorUnitario);
        
        // Valor Total
        const cellValorTotal = row.insertCell(3);
        const spanValorTotal = document.createElement('span');
        spanValorTotal.textContent = 'R$ 0,00';
        cellValorTotal.appendChild(spanValorTotal);
        
        // Ações
        const cellAcoes = row.insertCell(4);
        const removerLink = document.createElement('a');
        removerLink.href = '#';
        removerLink.className = 'remover-item';
        removerLink.textContent = 'Remover';
        cellAcoes.appendChild(removerLink);
        
        // Event listeners para cálculos
        inputQuantidade.addEventListener('change', calcularLinha);
        inputValorUnitario.addEventListener('input', formatarMoeda);
        inputValorUnitario.addEventListener('change', calcularLinha);
        
        // Event listener para remover linha
        removerLink.addEventListener('click', function(e) {
            e.preventDefault();
            const valorTotalLinha = parseFloat(spanValorTotal.textContent.replace('R$ ', '').replace(',', '.'));
            if (!isNaN(valorTotalLinha)) {
                totalGeral -= valorTotalLinha;
                atualizarTotalGeral();
            }
            itensTable.deleteRow(row.rowIndex - 1);
        });
    });
    
    // Formatador de moeda
    function formatarMoeda(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace('.', ',');
        value = value.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
        value = value.replace(/(\d)(\d{3}),/g, '$1.$2,');
        
        if (value === '0,00') {
            input.value = '';
        } else {
            input.value = 'R$ ' + value;
        }
    }
    
    function calcularLinha(event) {
        const row = event.target.closest('tr');
        const inputQuantidade = row.querySelector('.quantidade-input');
        const inputValorUnitario = row.querySelector('.valor-input');
        const spanValorTotal = row.querySelector('td:nth-child(4) span');
        
        const quantidade = parseInt(inputQuantidade.value) || 0;
        const valorUnitario = parseFloat(inputValorUnitario.value.replace(/\D/g, '')) / 100 || 0;
        
        const valorTotal = quantidade * valorUnitario;
        spanValorTotal.textContent = 'R$ ' + valorTotal.toFixed(2).replace('.', ',');
        
        // Atualizar total geral
        calcularTotalGeral();
    }
    
    function calcularTotalGeral() {
        totalGeral = 0;
        const linhas = itensTable.querySelectorAll('tr');
        
        linhas.forEach(row => {
            const valorTotalText = row.querySelector('td:nth-child(4) span').textContent;
            const valorTotal = parseFloat(valorTotalText.replace('R$ ', '').replace(',', '.')) || 0;
            totalGeral += valorTotal;
        });
        
        atualizarTotalGeral();
    }
    
    function atualizarTotalGeral() {
        totalGeralElement.textContent = 'R$ ' + totalGeral.toFixed(2).replace('.', ',');
    }
    
    // Gerar PDF
    gerarPDFBtn.addEventListener('click', async function() {
        if (!form.checkValidity()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        if (itensTable.rows.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

// Logo
try {
    const logoUrl = 'operacional-JP/ordem-compra-jpagricola/logo sem fundo.png';
    const logoData = await getBase64Image(logoUrl);
    doc.addImage(logoData, 'PNG', 15, 10, 30, 30);
} catch (e) {
    console.warn('Erro ao carregar logo.');
}

// Título
doc.setFontSize(16);
doc.setTextColor(46, 125, 50); // verde

// Empresa e título centralizados
doc.setFont(undefined, 'bold');
doc.text('JP AGRÍCOLA LTDA', 105, 15, { align: 'center' });
doc.setFontSize(14);
doc.setFont(undefined, 'normal');
doc.text('ORDEM DE COMPRA', 105, 23, { align: 'center' });

// Linha divisória
addLine(15, 28, 195);

// Dados do Pedido
let y = 32;
doc.setFontSize(12);
doc.setTextColor(0);
doc.setFont(undefined, 'bold');
doc.text('Dados do Pedido', 15, y);
y += 6;
doc.setFontSize(10);
doc.setFont(undefined, 'normal');
doc.text(`Data: ${formatDate(dataSolicitacao.value)}`, 15, y);
doc.text(`Solicitante: ${solicitante.value}`, 80, y);
doc.text(`Centro de Custo: ${centroCusto.value}`, 145, y);

// Dados do Fornecedor
y += 10;
doc.setFont(undefined, 'bold');
doc.text('Dados do Fornecedor', 15, y);
y += 6;
doc.setFont(undefined, 'normal');
doc.text(`Razão Social: ${fornecedorRazaoSocial.value}`, 15, y);
y += 5;
doc.text(`CNPJ: ${formatCpfCnpj(fornecedorCpfCnpj.value)}`, 15, y);
doc.text(`Telefone: ${formatTelefone(fornecedorTelefone.value)}`, 105, y);
y += 5;
doc.text(`E-mail: ${fornecedorEmail.value}`, 15, y);
y += 5;
doc.text(`Endereço: ${fornecedorEndereco.value}`, 15, y);

// Tabela de Itens
const itensData = Array.from(itensTable.querySelectorAll('tr')).map(row => [
    row.querySelector('.quantidade-input')?.value || '',
    row.querySelector('.descricao-input')?.value || '',
    row.querySelector('.valor-input')?.value || '',
    row.querySelector('td:nth-child(4) span')?.textContent || ''
]);

// Tabela
let tableY = y + 10;
doc.autoTable({
    startY: tableY,
    head: [['Qtd.', 'Produto/Serviço', 'Valor Unit.', 'Total']],
    body: itensData,
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    styles: { fontSize: 9, halign: 'left' },
    columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 100 },
        2: { halign: 'right', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 25 },
    },
});

// Dados finais
const finalY = doc.lastAutoTable.finalY + 10;
doc.setFontSize(10);
doc.text(`Forma de Pagamento: ${document.querySelector('input[name="pagamento"]:checked')?.value || ''}`, 15, finalY);
doc.text(`Prazo para Pagamento: ${prazoPagamento.value}`, 15, finalY + 6);
doc.text(`Total Geral: ${totalGeralElement.textContent}`, 160, finalY, { align: 'right' });

// Contato
doc.setFontSize(9);
doc.setTextColor(100);
doc.text('ENVIAR NOTAS FISCAIS E BOLETOS PARA:', 15, finalY + 14);
doc.text('contato@jpconsultoriaagricola.com.br', 15, finalY + 18);
doc.text('financeiro@jpconsultoriaagricola.com.br', 15, finalY + 22);
doc.text('adm@jpconsultoriaagricola.com.br', 15, finalY + 26);
doc.text('Telefone: 91 99112-9685', 15, finalY + 30);

// Salvar
const nomePDF = `OrdemCompra_${fornecedorRazaoSocial.value}_${formatDate(dataSolicitacao.value)}.pdf`;
doc.save(nomePDF);

function addLine(x1, y, x2) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(x1, y, x2, y);
}
