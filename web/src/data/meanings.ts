export type Card = { id: string; name: string; image: string }
import { minorNotes } from './minor'

const majors: Record<number, [string, string, string]> = {
  0: ['Kẻ Khờ', 'Khởi đầu · Tin tưởng · Tự do', 'Một con đường mới đang mở ra. Bạn không cần biết hết mọi bước đi; hãy bắt đầu bằng sự tò mò và lòng tin vào chính mình.'],
  1: ['Nhà Ảo Thuật', 'Chủ động · Tiềm năng · Sáng tạo', 'Bạn đã có nhiều nguồn lực hơn mình nghĩ. Điều quan trọng lúc này là chọn một hướng và biến ý tưởng thành hành động nhỏ, cụ thể.'],
  2: ['Nữ Tư Tế', 'Trực giác · Tĩnh lặng · Bí ẩn', 'Có điều chỉ sự yên tĩnh mới giúp bạn nhận ra. Hãy lắng nghe cảm giác đầu tiên trước khi tìm lời khuyên từ bên ngoài.'],
  3: ['Hoàng Hậu', 'Nuôi dưỡng · Phong phú · Dịu dàng', 'Cho bản thân không gian để lớn lên. Sự chăm sóc, sáng tạo và kết nối với điều đẹp đẽ sẽ mang lại năng lượng mới.'],
  4: ['Hoàng Đế', 'Cấu trúc · Vững vàng · Ranh giới', 'Một kế hoạch rõ ràng sẽ giúp bạn thấy an tâm hơn. Hãy đặt ra giới hạn cần thiết và kiên trì với điều bạn chọn.'],
  5: ['Giáo Hoàng', 'Tri thức · Truyền thống · Dẫn đường', 'Kinh nghiệm của người đi trước có thể soi sáng tình huống này. Hãy học điều hữu ích, rồi giữ lại góc nhìn riêng của mình.'],
  6: ['Người Tình', 'Lựa chọn · Kết nối · Đồng điệu', 'Hãy nhìn lại điều thực sự quan trọng với bạn. Một quyết định đẹp thường bắt đầu từ sự thành thật với trái tim mình.'],
  7: ['Cỗ Xe', 'Tiến bước · Ý chí · Tập trung', 'Bạn có thể tiến xa khi tập trung năng lượng vào một hướng. Đừng đợi mọi thứ hoàn hảo mới bắt đầu di chuyển.'],
  8: ['Sức Mạnh', 'Can đảm · Dịu dàng · Nội lực', 'Sức mạnh của bạn không nằm ở việc ép buộc. Kiên nhẫn và lòng trắc ẩn có thể đưa bạn qua điều khó khăn.'],
  9: ['Ẩn Sĩ', 'Chiêm nghiệm · Tìm kiếm · Ánh sáng', 'Một khoảng lặng sẽ giúp bạn nghe rõ câu trả lời. Hãy dành thời gian một mình mà không xem đó là sự chậm trễ.'],
  10: ['Bánh Xe Số Phận', 'Chuyển động · Chu kỳ · Cơ hội', 'Mọi thứ đang đổi thay. Bạn không kiểm soát được tất cả, nhưng có thể chọn cách đón nhận và thích nghi.'],
  11: ['Công Lý', 'Cân bằng · Sự thật · Trách nhiệm', 'Hãy nhìn vào sự việc như nó đang là. Một lựa chọn công bằng cần cả lý trí lẫn sự trung thực với chính mình.'],
  12: ['Người Treo Ngược', 'Tạm dừng · Góc nhìn mới · Buông bỏ', 'Có lẽ bạn chưa cần thúc đẩy mọi thứ. Thử nhìn từ một góc khác; sự tạm dừng cũng có thể là một bước tiến.'],
  13: ['Cái Chết', 'Khép lại · Chuyển hóa · Tái sinh', 'Một giai đoạn đang đi tới hồi kết. Khi bạn buông điều đã cũ, chỗ trống sẽ xuất hiện cho điều mới.'],
  14: ['Tiết Chế', 'Hài hòa · Kiên nhẫn · Chữa lành', 'Không cần vội vàng. Những bước nhỏ và đều đặn sẽ giúp bạn tìm lại nhịp cân bằng của riêng mình.'],
  15: ['Ác Quỷ', 'Ràng buộc · Nhận diện · Giải phóng', 'Hãy nhìn thẳng vào điều đang níu giữ bạn. Nhận ra một thói quen hay nỗi sợ là bước đầu để lựa chọn khác đi.'],
  16: ['Tòa Tháp', 'Thức tỉnh · Đổ vỡ · Sự thật', 'Một điều không còn vững có thể thay đổi bất ngờ. Dù khó chịu, sự thật sẽ giúp bạn xây lại trên nền tảng chân thực hơn.'],
  17: ['Ngôi Sao', 'Hy vọng · Hồi phục · Niềm tin', 'Sau những ngày nhiều biến động, ánh sáng dịu dàng vẫn ở đó. Hãy cho mình quyền hy vọng và hồi phục theo nhịp riêng.'],
  18: ['Mặt Trăng', 'Cảm xúc · Mơ hồ · Trực giác', 'Không phải mọi điều đều rõ ràng ngay lúc này. Hãy đi chậm, quan sát cảm xúc và đừng vội kết luận từ nỗi sợ.'],
  19: ['Mặt Trời', 'Rạng rỡ · Rõ ràng · Niềm vui', 'Một nguồn năng lượng ấm áp đang đến gần. Hãy cho phép mình vui với những tiến bộ, dù nhỏ, và chia sẻ ánh sáng ấy.'],
  20: ['Phán Xét', 'Thức tỉnh · Nhìn lại · Đổi mới', 'Bạn đang có cơ hội nhìn lại hành trình với sự thấu hiểu. Hãy chọn điều muốn mang theo vào chương tiếp theo.'],
  21: ['Thế Giới', 'Hoàn thành · Trọn vẹn · Mở rộng', 'Một vòng tròn đang khép lại. Hãy ghi nhận điều mình đã làm được trước khi bước sang hành trình mới.'],
}

const suitLabels: Record<string, string> = { Wands: 'Gậy', Cups: 'Cốc', Swords: 'Kiếm', Pents: 'Xu' }
const courtLabels: Record<number, string> = { 11: 'Tiểu Đồng', 12: 'Kỵ Sĩ', 13: 'Nữ Hoàng', 14: 'Quốc Vương' }

const majorNames: Array<[number, RegExp]> = [
  [0, /^(fool|le_mat|le_fou)$/],
  [1, /^(magician|le_bateleur)$/],
  [2, /^(high_priestess|la_papesse)$/],
  [3, /^(empress|l_imperatrice)$/],
  [4, /^(emperor|l_empereur)$/],
  [5, /^(hierophant|le_pape)$/],
  [6, /^(lovers|l_amoureux)$/],
  [7, /^(chariot|le_chariot)$/],
  [8, /^(strength|la_force)$/],
  [9, /^(hermit|l_ermite)$/],
  [10, /^(wheel_of_fortune|la_roue_de_fortune)$/],
  [11, /^(justice|la_justice)$/],
  [12, /^(hanged_man|le_pendu)$/],
  [13, /^(death|la_mort)$/],
  [14, /^(temperance|la_temperance)$/],
  [15, /^(devil|le_diable)$/],
  [16, /^(tower|la_maison_dieu|le_feu_du_ciel)$/],
  [17, /^(star|l_etoile|les_etoiles)$/],
  [18, /^(moon|la_lune)$/],
  [19, /^(sun|le_soleil)$/],
  [20, /^(judgement|le_jugement)$/],
  [21, /^(world|le_monde)$/],
]

const traditionalDecks = ['soimoi', 'rider-waite', 'marseille', 'vieville', 'visconti-sforza', 'oswald-wirth']

export function majorIndexFor(card: Card, deckId: string): number | null {
  if (!traditionalDecks.includes(deckId)) return null
  const match = card.id.match(/^\d{2}_(.+)$/)
  if (!match) return null
  return majorNames.find(([, pattern]) => pattern.test(match[1].toLowerCase()))?.[0] ?? null
}

export function meaningFor(card: Card, deckId: string) {
  const familiar = traditionalDecks.includes(deckId)
  const major = majorIndexFor(card, deckId)
  if (major !== null) {
    const [title, keywords, description] = majors[major]
    return { title, keywords, description }
  }
  const minor = card.id.match(/^(Wands|Cups|Swords|Pents)(\d{2})$/)
  if (familiar && minor) {
    const [, suit, number] = minor
    const rank = Number(number)
    const note = minorNotes[suit]?.[rank]
    if (!note) return { title: card.name, keywords: 'Quan sát · Chiêm nghiệm', description: 'Hãy nhìn kỹ hình ảnh và ghi lại chi tiết làm bạn chú ý.' }
    return {
      title: `${rank <= 10 ? rank : courtLabels[rank]} ${suitLabels[suit]}`,
      keywords: note[0],
      description: note[1],
    }
  }
  return {
    title: card.name,
    keywords: 'Quan sát · Cảm nhận · Chiêm nghiệm',
    description: 'Hãy dành một khoảnh khắc ngắm lá bài này. Hình ảnh hoặc chi tiết nào thu hút bạn đầu tiên? Cảm giác ấy có thể là điểm bắt đầu cho câu trả lời của riêng bạn.',
  }
}
